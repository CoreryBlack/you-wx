"use strict";const t=require("../../utils/http.js");exports.getOilCards=(s={})=>t.http.get("/cards",{params:s}),exports.getTransactions=(s={})=>t.http.get("/oil/transactions",{params:s});
