var HrmsBaoNghiNgayLam={
	run:function(p){
		HrmsBaoNghiNgayLam.url = NUT.services[2].url;
		NUT.ds.select({url:HrmsBaoNghiNgayLam.url+"data/nhanvien_v",select:"makhuvuc,madoitac",where:["manhanvien","=",n$.user.username]},function(res){
			if(res.success&&res.result.length){
				HrmsBaoNghiNgayLam.nv=res.result[0];
				var items=NUT.domains[81].items;
				var cbo=document.createElement("select");
				cbo.disabled=true;
				cbo.id="cboInOut_MaKhuVuc";
				cbo.innerHTML="<option value='"+HrmsBaoNghiNgayLam.nv.makhuvuc+"' selected>"+NUT.domains[81].lookup[HrmsBaoNghiNgayLam.nv.makhuvuc]+"</option>";
				for(var i=0;i<items.length;i++){
					if(items[i].id!=HrmsBaoNghiNgayLam.nv.makhuvuc){
						var opt=document.createElement("option");
						opt.value=items[i].id;
						opt.innerHTML=items[i].text;
						cbo.options.add(opt);
					}
				}
				cbo.setAttribute("onchange","HrmsBaoNghiNgayLam.maKhuVuc_onChange(this.value)");
				var now=new Date();
				HrmsBaoNghiNgayLam.ngayNghi=now;
				NUT.w2popup.open({
					title: '🏖️ <i>Báo nghỉ ngày làm việc</i>',
					modal:true,
					width: 360,
					height: 420,
					body: "<table style='margin:auto;color:brown'><caption><h3>Bạn xin nghỉ làm Ngày</h3></caption><tr><td><select onchange='HrmsBaoNghiNgayLam.cboNgayNghi_onChange(this.value)'><option value=0>Hôm nay</option><option value=1>Ngày mai</option><option value=2>Ngày kia</option></select></td><td style='border:1px solid'><h1 id='labNgayNghi'>"+now.toLocaleDateString()+"</h1></td></tr></table><table style='margin:auto'><caption><h3>Ca làm việc</h3></caption><tr><td align='right'>Khu vực</td><td>"+cbo.outerHTML+"</td></tr><tr><td align='right'>Điểm bán</td><td><select id='cboMaDiemBan'></select></td></tr><tr><td align='right'>Điểm bán 2</td><td><select id='cboMaDiemBan2'></select></td></tr><tr><td align='right'>Lý do *</td><td><textarea id='txtLyDo'></textarea></td></tr></table>",
					buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Cancel</button><button class="w2ui-btn" onclick="HrmsBaoNghiNgayLam.guiXinPhep()">✔️ Gửi</button>'
				});
				HrmsBaoNghiNgayLam.maKhuVuc_onChange(HrmsBaoNghiNgayLam.nv.makhuvuc);
			}else NUT.notify(n$.user.username + " Nhân viên không có.","yellow");
		});
	},
	maKhuVuc_onChange:function(val){
		cboMaDiemBan.innerHTML="<option></option>";
		if(val) NUT.ds.select({url:HrmsBaoNghiNgayLam.url+"data/diemban",where:["makhuvuc","=",val]},function(res){
			for(var i=0;i<res.result.length;i++){
				var db=res.result[i];
				var opt=document.createElement("option");
				opt.value=db.madiemban;
				opt.innerHTML=db.tendiemban;
				cboMaDiemBan.options.add(opt);
			}
			cboMaDiemBan2.innerHTML=cboMaDiemBan.innerHTML;
		})
	},
	cboNgayNghi_onChange:function(val){
		HrmsBaoNghiNgayLam.ngayNghi=new Date();
		HrmsBaoNghiNgayLam.ngayNghi.setDate(HrmsBaoNghiNgayLam.ngayNghi.getDate()+parseInt(val));
		labNgayNghi.innerHTML=HrmsBaoNghiNgayLam.ngayNghi.toLocaleDateString();
	},
	guiXinPhep:function(){
		if(txtLyDo.value&&(cboMaDiemBan.value||cboMaDiemBan2.value)){
			var nam=HrmsBaoNghiNgayLam.ngayNghi.getFullYear();
			var thang=HrmsBaoNghiNgayLam.ngayNghi.getMonth()+1;
			var ngay=HrmsBaoNghiNgayLam.ngayNghi.getDate();
			var makhuvuc=HrmsBaoNghiNgayLam.nv.makhuvuc;
			NUT.ds.select({url:HrmsBaoNghiNgayLam.url+"data/chamcong",select:"chamcong",where:[["nam","=",nam],["thang","=",thang],["ngay","=",ngay],["madoitac","=",n$.user.tag],["manhanvien","=",n$.user.username],["dulieu","=",0]]},function(res){
				if(res.result.length){
					NUT.w2alert(res.result[0].chamcong?"Bạn đã xin nghỉ ngày #"+labNgayNghi.innerHTML:"Bạn đã Check in/out ngày #"+labNgayNghi.innerHTML);
				}else{
					var data=[];
					if(cboMaDiemBan.value)data.push({nam:nam,thang:thang,ngay:ngay,madoitac:n$.user.tag,manhanvien:n$.user.username,chamcong:"KL",makhuvuc:makhuvuc,madiemban:cboMaDiemBan.value,lan:1,lydo:txtLyDo.value,dulieu:0});
					if(cboMaDiemBan2.value)data.push({nam:nam,thang:thang,ngay:ngay,madoitac:n$.user.tag,manhanvien:n$.user.username,chamcong:"KL",makhuvuc:makhuvuc,madiemban:cboMaDiemBan2.value,lan:2,lydo:txtLyDo.value,dulieu:0});
					NUT.ds.insert({url:HrmsBaoNghiNgayLam.url+"data/chamcong",data:data},function(res){
						NUT.notify("Records inserted.","lime");
						NUT.w2popup.close();
					});
				}
			});
		}else NUT.w2alert("Chọn Ca làm việc và ghi Lý do xin nghỉ!");
	}
}