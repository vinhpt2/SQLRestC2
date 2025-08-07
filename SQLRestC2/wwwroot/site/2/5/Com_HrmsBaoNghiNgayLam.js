var Com_HrmsBaoNghiNgayLam={
	run:function(p){
		var self=this;
		self.urledit=_context.service["hrms"].urledit;
		NUT_DS.select({url:self.urledit+"nhanvien_v",select:"makhuvuc,madoitac",where:["manhanvien","=",_context.user.username]},function(nv){
			if(nv.length){
				self.makhuvuc=nv[0].makhuvuc;
				self.madoitac=nv[0].madoitac;
				var items=_context.domain[9].items;
				var cbo=document.createElement("select");
				cbo.id="cboInOut_MaKhuVuc";
				cbo.innerHTML="<option value='"+self.makhuvuc+"' selected>"+_context.domain[9].lookup[self.makhuvuc]+"</option>";
				for(var i=0;i<items.length;i++){
					if(items[i].id!=self.makhuvuc){
						var opt=document.createElement("option");
						opt.value=items[i].id;
						opt.innerHTML=items[i].text;
						cbo.options.add(opt);
					}
				}
				cbo.setAttribute("onchange","Com_HrmsBaoNghiNgayLam.cboInOut_MaKhuVuc_onChange(this.value)");
				NUT_DS.getNow(function(now){
					self.now=now;
					self.ngayNghi=new Date(now);
					w2popup.open({
						title: '🏖️ <i>Báo nghỉ làm việc</i>',
						modal:true,
						width: 360,
						height: 420,
						body: "<table style='margin:auto;color:brown'><caption><h3>Bạn xin nghỉ làm Ngày</h3></caption><tr><td><select onchange='Com_HrmsBaoNghiNgayLam.cboNgayNghi_onChange(this.value)'><option value=0>Hôm nay</option><option value=1>Ngày mai</option><option value=2>Ngày kia</option></select></td><td style='border:1px solid'><h1 id='labNgayNghi'>"+self.now.toLocaleDateString()+"</h1></td></tr></table><table style='margin:auto'><caption><h3>Ca làm việc</h3></caption><tr><td align='right'>Khu vực</td><td>"+cbo.outerHTML+"</td></tr><tr><td align='right'>Điểm bán</td><td><select id='cboInOut_MaDiemBan'></select></td></tr><tr><td align='right'>Điểm bán 2</td><td><select id='cboInOut_MaDiemBan2'></select></td></tr><tr><td align='right'>Lý do *</td><td><textarea id='txtLyDo'></textarea></td></tr></table>",
						buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Cancel</button><button class="w2ui-btn" onclick="Com_HrmsBaoNghiNgayLam.guiXinPhep()">✔️ Gửi</button>'
					});
					self.cboInOut_MaKhuVuc_onChange(self.makhuvuc);
				});
			}
		});
	},
	cboInOut_MaKhuVuc_onChange:function(val){
		cboInOut_MaDiemBan.innerHTML="<option></option>";
		if(val) NUT_DS.select({url:this.urledit+"diemban",where:["makhuvuc","=",val]},function(res){
			for(var i=0;i<res.length;i++){
				var opt=document.createElement("option");
				opt.value=res[i].madiemban;
				opt.innerHTML=res[i].tendiemban;
				cboInOut_MaDiemBan.options.add(opt);
			}
			cboInOut_MaDiemBan2.innerHTML=cboInOut_MaDiemBan.innerHTML;
		})
	},
	cboNgayNghi_onChange:function(val){
		this.ngayNghi=new Date(this.now);
		this.ngayNghi.setDate(this.ngayNghi.getDate()+parseInt(val));
		labNgayNghi.innerHTML=this.ngayNghi.toLocaleDateString();
	},
	guiXinPhep:function(){
		if(txtLyDo.value&&(cboInOut_MaDiemBan.value||cboInOut_MaDiemBan2.value)){
			var nam=this.ngayNghi.getFullYear();
			var thang=this.ngayNghi.getMonth()+1;
			var ngay=this.ngayNghi.getDate();
			var makhuvuc=this.makhuvuc;
			NUT_DS.select({url:this.urledit+"chamcong_v",select:"chamcong",where:[["nam","=",nam],["thang","=",thang],["ngay","=",ngay],["madoitac","=",_context.user.ext],["manhanvien","=",_context.user.username],["dulieu","=",0]]},function(res){
				if(res.length){
					w2alert(res[0].chamcong?"Bạn đã xin nghỉ ngày #"+labNgayNghi.innerHTML:"Bạn đã Check in/out ngày #"+labNgayNghi.innerHTML);
				}else{
					var data=[];
					if(cboInOut_MaDiemBan.value)data.push({nam:nam,thang:thang,ngay:ngay,madoitac:_context.user.ext,manhanvien:_context.user.username,chamcong:"KL",makhuvuc:makhuvuc,madiemban:cboInOut_MaDiemBan.value,lan:1,lydo:txtLyDo.value});
					if(cboInOut_MaDiemBan2.value)data.push({nam:nam,thang:thang,ngay:ngay,madoitac:_context.user.ext,manhanvien:_context.user.username,chamcong:"KL",makhuvuc:makhuvuc,madiemban:cboInOut_MaDiemBan2.value,lan:2,lydo:txtLyDo.value});
					NUT_DS.insert({url:_context.service["hrms"].urledit+"chamcong_v",data:data},function(res){
						NUT.tagMsg("Records inserted.","lime");
						w2popup.close();
					});
				}
			});
		}else w2alert("Chọn Ca làm việc và ghi Lý do xin nghỉ!");
	}
}