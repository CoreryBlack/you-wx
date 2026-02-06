// 交易记录解析工具
function formatMoneyFromCents(cents) {
  const n = Number(cents) || 0
  return Number((n / 100).toFixed(2))
}

function formatMoneyStr(cents) {
  return `¥${formatMoneyFromCents(cents).toFixed(2)}`
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  const pad = (v) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function maskCardNo(no) {
  if (!no) return ''
  const s = String(no)
  const last = s.slice(-4)
  if (!last) return ''
  return `****...${last}`
}

function abbrevOrderId(id) {
  if (!id) return ''
  const s = String(id)
  if (s.length <= 10) return s
  const first = s.slice(0, 6)
  const last = s.slice(-4)
  return `${first}...${last}`
}

function statusText(status) {
  if (status === 1) return '成功'
  if (status === 0) return '失败'
  return status == null ? '' : String(status)
}

function mapTypeLabel(r) {
  const text = (r.typeDesc || r.type_desc || '').toString()
  // 优先根据后端描述映射
  if (/充值/.test(text)) return '油卡充值'
  if (/退款/.test(text)) return '退款'
  if (/积分/.test(text) && /增|增加/.test(text)) return '积分增加'
  if (/积分/.test(text) && /消|消费/.test(text)) return '积分消费'
  if (/支出|消费/.test(text)) return '支出'

  // 若没有描述，则根据类型编号做简单映射（常见）
  const t = Number(r.type)
  switch (t) {
    case 1: return '油卡充值'
    case 2: return '油卡充值'
    case 3: return '支出'
    case 4: return '积分增加'
    case 5: return '积分消费'
    case 6: return '退款'
    default: return text || '其他'
  }
}

export function parseTransactionsApiRes(res) {
  // 支持后端返回包裹结构：{ code:0, data: { records: [...] } }
  const payload = res && res.data ? res.data : res
  const records = payload.records || payload.list || []
  const list = records.map(r => ({
    id: r.txnId || r.id || r.txn_id || '',
    userId: r.userId || r.user_id || r.user || '',
    amount: formatMoneyFromCents(r.amountCents ?? r.amount_cents ?? r.amount),
    amountStr: formatMoneyStr(r.amountCents ?? r.amount_cents ?? r.amount),
    balanceBefore: formatMoneyFromCents(r.balanceBefore ?? r.balance_before ?? r.balanceBeforeCents ?? 0),
    balanceAfter: formatMoneyFromCents(r.balanceAfter ?? r.balance_after ?? 0),
    cardNoMasked: maskCardNo(r.cardNo || r.card_no || ''),
    createTime: formatDateTime(r.createTime || r.create_time || r.created_at),
    orderId: r.orderId || r.order_id || '',
    orderIdShort: abbrevOrderId(r.orderId || r.order_id || ''),
    txnIdShort: abbrevOrderId(r.txnId || r.txn_id || r.id || ''),
    type: r.type,
    typeDesc: r.typeDesc || r.type_desc || r.typeName || '',
    typeLabel: mapTypeLabel(r),
    status: r.status,
    statusDesc: r.statusDesc || statusText(r.status),
    raw: r
  }))
  const total = payload.total ?? payload.count ?? payload.totalCount ?? (payload.totalPages ? (payload.total || records.length) : (payload.total || records.length || 0))
  return { list, total }
}

export default { parseTransactionsApiRes }
