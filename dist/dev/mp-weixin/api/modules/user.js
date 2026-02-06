"use strict";const e=require("../../utils/http.js");exports.getUserInfo=(t={})=>t.openId?e.http.get(`/users/profile?openId=${encodeURIComponent(t.openId)}`):e.http.get("/users/profile");
