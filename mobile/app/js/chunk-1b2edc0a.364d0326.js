(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-1b2edc0a"],{"0060":function(r,e,n){"use strict";n.r(e);var s=function(){var r=this,e=r.$createElement,n=r._self._c||e;return n("div",{staticClass:"info-page"},[n("div",[n("van-nav-bar",{attrs:{title:"修改密码","left-text":"返回","left-arrow":""},on:{"click-left":r.onClickLeft}})],1),n("div",{staticClass:"content"},[n("div",{staticClass:"form-page"},[n("van-cell-group",{staticClass:"form"},[n("form",{ref:"userForm",attrs:{method:"POST"},on:{submit:function(e){return e.preventDefault(),r.change(e)}}},[n("van-field",{attrs:{type:"password",label:"当前密码",error:!!r.errorMsg.password,placeholder:r.errorMsg.password?r.errorMsg.password:"请输入当前密码","error-message":r.userForm.password?r.errorMsg.password:"",required:""},on:{focus:function(e){r.errorMsg.password=""},blur:function(e){return r.checkupForm("password")}},model:{value:r.userForm.password,callback:function(e){r.$set(r.userForm,"password",e)},expression:"userForm.password"}}),n("van-field",{attrs:{type:"password",label:"新密码",error:!!r.errorMsg.newpassword,placeholder:r.errorMsg.newpassword?r.errorMsg.newpassword:"请输入新密码","error-message":r.userForm.newpassword?r.errorMsg.newpassword:"",required:""},on:{focus:function(e){r.errorMsg.newpassword=""},blur:function(e){return r.checkupForm("password")}},model:{value:r.userForm.newpassword,callback:function(e){r.$set(r.userForm,"newpassword",e)},expression:"userForm.newpassword"}}),n("van-field",{attrs:{type:"password",label:"重复新密码",error:!!r.errorMsg.newpassword2,placeholder:r.errorMsg.newpassword2?r.errorMsg.newpassword2:"请输入新密码","error-message":r.userForm.newpassword2?r.errorMsg.newpassword2:"",required:""},on:{focus:function(e){r.errorMsg.newpassword2=""},blur:function(e){return r.checkupForm("newpassword2")}},model:{value:r.userForm.newpassword2,callback:function(e){r.$set(r.userForm,"newpassword2",e)},expression:"userForm.newpassword2"}}),n("div",{staticClass:"login"},[n("van-button",{attrs:{type:"info",size:"normal"},on:{click:r.change}},[r._v("修改密码")])],1)],1)])],1)])])},t=[],o=(n("96cf"),n("3b8d")),a=n("8a1f"),u=n("2b0e"),c={mixins:[a["a"]],data:function(){var r=this;return{userForm:{password:"",newpassword:"",newpassword2:""},errorMsg:{password:"",newpassword:"",newpassword2:""},validates:{password:function(){var e=Object(o["a"])(regeneratorRuntime.mark((function e(n){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,r.checkPass(n);case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)})));function n(r){return e.apply(this,arguments)}return n}(),newpassword2:function(){var e=Object(o["a"])(regeneratorRuntime.mark((function e(n){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(n!=r.userForm.password){e.next=4;break}return e.abrupt("return","");case 4:return e.abrupt("return","重复密码与密码不一致");case 5:case"end":return e.stop()}}),e)})));function n(r){return e.apply(this,arguments)}return n}()}}},computed:{},methods:{onClickLeft:function(){this.$router.back()},change:function(){var r=this;u["a"].axios.post("/user/changepassword",this.userForm).then((function(){r.$toast({message:"密码修改成功"}),setTimeout((function(){return r.$router.push("/my")}),1e3)})).catch((function(e){r.$toast({message:"密码修改失败"})}))},checkupForm:function(r){var e=this,n=this.userForm[r];this.validates[r](n).then((function(n){e.errorMsg[r]=n}))}},beforeRouteLeave:function(r,e,n){this.userForm.password="",this.userForm.newpassword="",this.userForm.newpassword2="",n()}},i=c,p=(n("0e15"),n("2877")),w=Object(p["a"])(i,s,t,!1,null,"74c2d496",null);e["default"]=w.exports},"0e15":function(r,e,n){"use strict";var s=n("4c59"),t=n.n(s);t.a},"4c59":function(r,e,n){},"8a1f":function(r,e,n){"use strict";n("96cf");var s=n("3b8d"),t=n("b255"),o=n("2b0e");e["a"]={methods:{checkName:function(r){var e=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return new Promise((function(s,o){var a=t["c"];r.length<6?s("用户名长度必须为6到12位"):a.test(r)?n&&e.getUserExist(r).then((function(r){s(r?"用户名已存在":"")})):s("请输入合法用户名(字母开头的字母/数字任意组合)")}))},checkPass:function(r){return new Promise((function(e,n){var s=t["b"],o="";r.length<6?o="请输入6到12位长度的密码":s.test(r)||(o="含有非法字符,请重新输入"),e(o)}))},checkEmail:function(r){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return new Promise((function(n,s){var a=t["a"];a.test(r)?e&&o["a"].axios.get("/user/emailexist?email=".concat(r)).then((function(r){r.data?n("邮箱已被使用,请绑定其他邮箱"):n("")})):n("请输入正确的邮箱地址")}))},checkPhoneNumberExist:function(r){return new Promise((function(e,n){var s=/^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;s.test(r)?o["a"].axios.get("/user/phonenumberexist?phonenumber=".concat(r)).then((function(r){r.data?e(""):e("输入的手机号未注册")})):e("请输入正确的手机号")}))},checkPhoneNumber:function(r){return new Promise((function(e,n){var s=/^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;s.test(r)?o["a"].axios.get("/user/phonenumberexist?phonenumber=".concat(r)).then((function(r){r.data?e("手机号已被使用,请绑定其他号码"):e("")})):e("请输入正确的手机号")}))},getUserExist:function(){var r=Object(s["a"])(regeneratorRuntime.mark((function r(e){var n;return regeneratorRuntime.wrap((function(r){while(1)switch(r.prev=r.next){case 0:return r.next=2,o["a"].axios.get("/user/userexist?username=".concat(e)).then((function(r){n=r.data}));case 2:return r.abrupt("return",n);case 3:case"end":return r.stop()}}),r)})));function e(e){return r.apply(this,arguments)}return e}()}}},b255:function(r,e,n){"use strict";n.d(e,"c",(function(){return s})),n.d(e,"b",(function(){return t})),n.d(e,"a",(function(){return o}));var s=/^\w[\d\w]{5,11}$/,t=/^[\d\w~!@#$%^&()_+=-]{6,12}$/,o=/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/}}]);