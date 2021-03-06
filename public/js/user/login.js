$(function(){

	var login_success_url = ['owner','design']
	$('#form-login').submit(function(){
		var userName = $('#login-account').val();
		var passWord = $('#login-password').val();
		$.ajax({
			url:RootUrl+'api/v1/login',
			type: 'post',
			contentType : 'application/json; charset=utf-8',
			dataType: 'json',
			data : JSON.stringify({
				phone : userName,
				pass  : passWord
			}),
			processData : false,
			success: function(res){
				if(res["data"]){
					window.location.href = login_success_url[res.data.usertype-1]+'.html'
				}else{
					$('#form-login').find('.m-error-info').html(res['error_msg']).removeClass('hide');
					console.log(res['error_msg']);	
				}
				
		        //$('#form-login').find('m-error-info').html(msg).removeClass('hide');
		   	}
		});
		return false;
	})
	// function isInput(str){
	// 	return $.trim(str) != '' ? true : false 
	// }
	$('#saveUserInfo').on('click',function(ev){
		if(!$('#saveUserInfo').find('input').attr("checked")){
			$('#saveUserInfo').find('input').attr("checked",true)
		}else{
			$('#saveUserInfo').find('input').attr("checked",false)
		}
		saveUserInfo()
	})
	
	function saveUserInfo(){
		var userName = $("#login-account").val(); 
		var passWord = $("#login-password").val();
		if ($('#saveUserInfo').find('input').attr("checked")) { 
			setCookie("rmbUser", "true",  7 ); // 存储一个带7天期限的 cookie 
			setCookie("userName", userName, 7 ); // 存储一个带7天期限的 cookie 
			setCookie("passWord", passWord,  7 ); // 存储一个带7天期限的 cookie 
		}else{ 
			delCookie("rmbUser"); 
			delCookie("userName"); 
			delCookie("passWord"); 
		} 
	}
	//记住密码
	$("#login-account").val(getCookie("userName"));
	$("#login-password").val(getCookie("passWord"));
	$('#saveUserInfo').find('input').attr("checked",getCookie("rmbUser"))
	function yanzhen(){
		var account = $('#login-account');
		var password = $('#login-password');
		if(!isMobile(account.val())){
			return false;
		}
		if(!isPassword(password.val())){
			return false;
		}
		return true;
	}


	function isMobile(mobile){
		return /^(13[0-9]{9}|15[012356789][0-9]{8}|18[0123456789][0-9]{8}|147[0-9]{8}|170[0-9]{8}|177[0-9]{8})$/.test(mobile);
	}
	function isPassword(str){
	   return (/^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/.test(str));
	}
	function isVerifyCode(num){
	   return (/^[\d]{6,22}$/.test(str));
	}


	function setCookie(name,value,exp,path,domain) {
        var exp = exp || 0;
        var et = new Date();
        if ( exp != 0 ) {
            et.setTime(et.getTime() + exp*3600000);
        } else {
            et.setHours(23); et.setMinutes(59); et.setSeconds(59); et.setMilliseconds(999);
        }
        var more = "";
        var path = path || "/";
        var domain = domain || "";
        if (domain != "")
            more += "; domain="+domain;
        more += "; path="+path;
        document.cookie = name + "=" + escape(value) + more + "; expires=" + et.toGMTString();
    }

    function getCookie(name) {
        var res = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        return null != res ? unescape(res[2]) : null;
    }

    function delCookie(name) {
        var value = getCookie(name);
        if (null != value) { 
        	setCookie(name,value,-9);
        }
    }

	$('#reg-account').blur(function(){
		alert(isPassword($(this).val()))
	})
	var fn1 = new ComboBox({
		id:'huxing',
		list:['1111','51111']
	})
	var fn2 = new ComboBox({
		id:'huxing1',
		list:['1','5']
	})
	var fn3 = new ComboBox({
		id:'huxing2',
		list:['xddd','dddd','3333'],
		btn : false
	})
	var fn4 =new OnlinePrice({
		id : 'form-OnlinePrice',
		list : ['基础工程','其他工程','设计费','主卧']
	});

	//var fn5 = new Popup()
});
/*
	下拉选择框插件
	3个参数：
		1：id用来生成input的name值的提供给后台
		2：下拉选项列表数据
		3：是否有下拉箭头按钮
*/
(function($){
	function ComboBox(options){
		var self = this;
		this.win = $(window);
		this.doc = $(document);
		this.body = $(document.body);
		$.extend(this.settings = {
			id : null,
			list : [],
			btn : true
		},options || {})
		this.selectBox = $('#'+this.settings.id);
		this.input = $('<input type="hidden" name="'+this.settings.id+'" value="'+this.settings.list[0]+'" />');
		this.option = $('<div class="option"><span class="value">'+this.settings.list[0]+'</span>'+(this.settings.btn?'<span class="arrow"><em></em><i></i></span>':'')+'</div>')
		this.createList(this.settings.list);
		this.selectBox.append(this.input);
		this.selectBox.append(this.option);
		this.select = this.selectBox.find('.select');
		this.selectEvent();
	}
	ComboBox.prototype = {
		createList : function(data){
			var sLi = '<ul class="select">';
			for (var i = 0; i < data.length; i++) {
				sLi+= '<li><a href="javascript:;">'+data[i]+'</a></li>'
			};
			sLi+='</ul>';
			this.selectBox.append(sLi);
		},
		selectEvent : function(){
			var self = this;
			self.option.on('click' , function(ev){
				self.body.click(); 
				self.selectShow();
				return false;
			});
			this.body.on('click' , function(ev){
				self.selectHide(); 
			});
			this.select.delegate('li', 'click' , function(ev){
				ev.stopPropagation();
				var value = $(this).find('a').text();
				self.input.val(value)
				self.option.find('.value').html(value);
				self.selectHide();
			});
		},
		selectHide : function(){
			this.selectBox.each(function(index, el) {
				$(el).css('zIndex',5).find('.select').hide();
			});
		},
		selectShow : function(){
			this.select.show(); 
			this.selectBox.css('zIndex',20)
		}
	}
	window["ComboBox"] = ComboBox;
})(jQuery);
/*
	表单验证
	FormValidation

*/
(function($){
	function FormValidation(options){
		var self = this;
		this.win = $(window);
		this.doc = $(document);
		this.body = $(document.body);
		this.settings = {
			id : null,
			list : [],
			btn : true
		}
		$.extend(this.settings,options || {});
		this.formBox = $('#'+this.settings.id);
		
	}
	FormValidation.prototype = {
		verify : function(value){

		}
	}
	window["FormValidation"] = FormValidation;
})(jQuery);
/*
	在线报价
	2个参数：
		1：id用来生成input的name值的提供给后台
		2：下拉选项列表数据
*/
(function($){
	function OnlinePrice(options){
		var self = this;
		this.win = $(window);
		this.doc = $(document);
		this.body = $(document.body);
		$.extend(this.settings = {
			id : null,
			list : ['基础工程','水电工程','客餐厅及走道','衣帽间','书房','厨房','安装工程','其他工程','设计费','主卧']
		},options || {});
		this.countId = 0;
		this.PriceBox = $('#'+this.settings.id);
		this.tBody = this.PriceBox.find('tbody');
		this.createItem = this.PriceBox.find('.createItem');
		this.allPrice = this.PriceBox.find('.allPrice');
		this.createTrList(this.settings.list);
		this.createTrEvent();
		this.deleteTrEvent();
		this.reckonTrPrice();
		this.reckonAllPrice();
	}
	OnlinePrice.prototype = {
		createTrData : function(data){
			var self = this;
			var oTr = $('<tr>');
			oTr.append($('<td>'+data+'</td>'));
			oTr.append($('<td><input type="text" class="price" name="'+this.settings.id+"-num-"+self.countId+'" id="'+this.settings.id+"-num-"+self.countId+'" placeholder="请输入整数金额" /></td>'));
			oTr.append($('<td><textarea rows="3" class="remark" name="'+this.settings.id+"-con-"+this.countId+'" id="'+this.settings.id+"-con-"+this.countId+'"></textarea></td>'));
			oTr.append($('<td><a href="javascript:;" class="delete">删除</a></td>'))
			this.tBody.append(oTr);
		},
		createTrEvent : function(){
			var self = this;
			this.createItem.on('click',function(){
				self.countId++;
				var name = prompt("请输入新项目名称", "");
				if(!!name){
					self.createTrData(name) 
				}else{
					alert('请输入新项目名称')
				}
			})
		},
		deleteTrEvent : function(){
			var self = this;
			this.PriceBox.delegate('.delete','click',function(ev){
				ev.stopPropagation();
				if (confirm("你确定删除吗？")) {  
		            $(this).closest('tr').remove();
		            self.reckonAllPrice(); 
		        }
			})
		},
		createTrList : function(data){
			for (var i = 0; i < data.length; i++) {
				this.countId = i;
				this.createTrData(data[i])
			};
		},
		reckonTrPrice : function(){
			var self = this;
			this.PriceBox.delegate('tr','focus blur input keyup propertychange resetplaceholder',function(ev){
				ev.stopPropagation();
				self.reckonAllPrice();			 
			})
		},
		reckonAllPrice : function(){
			var self = this;
			var aPrice = this.PriceBox.find('.price');
			var price = 0;
			var all = 0;
			aPrice.each(function(i,el){
				if(self.settings.list[i] == '设计费'){
					all = isNaN(parseInt(aPrice.eq(i).val())) || parseInt(aPrice.eq(i).val()) === '' ? 0 : parseInt(aPrice.eq(i).val());
				}
				price += isNaN(parseInt(aPrice.eq(i).val())) || parseInt(aPrice.eq(i).val()) === '' ? 0 : parseInt(aPrice.eq(i).val());
			})
			var html = '工程总造价：'+(price-all)+'元（不含设计费）项目总造价：'+price+'元（含设计费）'
			this.allPrice.html(html)
		},
	}
	window["OnlinePrice"] = OnlinePrice;
})(jQuery);
