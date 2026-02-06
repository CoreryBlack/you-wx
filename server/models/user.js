// 简单的 User 实体（内存实现），用于开发和测试
// 生产应替换为数据库模型（例如 Sequelize / TypeORM / Knex + MySQL）

class UserModel {
  constructor() {
    // key: openid, value: user object
    this.store = new Map();
    this.nextId = 1;
  }

  // 生成新的 user_id
  genId() {
    return `u_${this.nextId++}`;
  }

  // 创建或更新用户（通过 openid）
  createOrUpdateByOpenid(openid, attrs = {}) {
    if (!openid) throw new Error('openid required');

    let user = this.store.get(openid);
    const now = new Date().toISOString();

    if (!user) {
      const user_id = this.genId();
      user = {
        user_id,
        openid,
        unionid: attrs.unionid || null,
        phone: attrs.phone || null,
        nickname: attrs.nickname || attrs.nickName || '',
        avatar_url: attrs.avatar_url || attrs.avatarUrl || '',
        gender: attrs.gender || 0,
        country: attrs.country || '',
        province: attrs.province || '',
        city: attrs.city || '',
        status: 1,
        create_time: now,
        update_time: now
      };
      this.store.set(openid, user);
    } else {
      // update fields
      user.nickname = attrs.nickname || attrs.nickName || user.nickname;
      user.avatar_url = attrs.avatar_url || attrs.avatarUrl || user.avatar_url;
      user.gender = attrs.gender || user.gender;
      user.country = attrs.country || user.country;
      user.province = attrs.province || user.province;
      user.city = attrs.city || user.city;
      user.update_time = now;
      // unionid / phone 更新如果提供
      if (attrs.unionid) user.unionid = attrs.unionid;
      if (attrs.phone) user.phone = attrs.phone;
      this.store.set(openid, user);
    }

    return user;
  }

  findByOpenid(openid) {
    return this.store.get(openid) || null;
  }

  findById(user_id) {
    for (const u of this.store.values()) {
      if (u.user_id === user_id) return u;
    }
    return null;
  }

  updateById(user_id, attrs = {}) {
    const user = this.findById(user_id);
    if (!user) return null;
    const now = new Date().toISOString();
    if (attrs.nickname !== undefined) user.nickname = attrs.nickname;
    if (attrs.phone !== undefined) user.phone = attrs.phone;
    if (attrs.avatar_url !== undefined) user.avatar_url = attrs.avatar_url;
    user.update_time = now;
    this.store.set(user.openid, user);
    return user;
  }

  // 返回所有用户（用于调试）
  all() {
    return Array.from(this.store.values());
  }
}

// 单例模型
const User = new UserModel();
module.exports = User;
