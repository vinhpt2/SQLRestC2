var Com_HrmsGiaiTrinhKhongCheckIn={
	run:function(p){
		var self=this;
		self.urledit=_context.service["hrms"].urledit;
		NUT_DS.select({url:self.urledit+"nhanvien_v",select:"makhuvuc,madoitac",where:["manhanvien","=",_context.user.username]},function(nv){
			if(nv.length){
				self.makhuvuc=nv[0].makhuvuc;
				self.madoitac=nv[0].madoitac;
				var items=_context.domain[35].items;
				var cbo=document.createElement("select");
				cbo.id="cboInOut_NguyenNhan";
				//cbo.innerHTML="<option value='"+self.makhuvuc+"' selected>"+_context.domain[9].lookup[self.makhuvuc]+"</option>";
				for(var i=0;i<items.length;i++){
					var opt=document.createElement("option");
					opt.value=items[i].id;
					opt.innerHTML=items[i].text;
					cbo.options.add(opt);
				}

				NUT_DS.getNow(function(now){
					self.now=now;
					self.ngayNghi=new Date(now);
					w2popup.open({
						title: '😅 <i>Báo không Check-In</i>',
						modal:true,
						width: 360,
						height: 540,
						body: "<table style='margin:auto;color:brown'><caption><h3>Bạn không check-in Ngày</h3></caption><tr><td><select onchange='Com_HrmsGiaiTrinhKhongCheckIn.cboNgayNghi_onChange(this.value)'><option value=0>Hôm nay</option><option value=-1>Ngày mai</option><option value=-2>Ngày kia</option><option value=1>Hôm qua</option><option value=2>Hôm kia</option><option value=3>Trước đây 3 ngày</option><option value=4>Trước đây 4 ngày</option><option value=5>Trước đây 5 ngày</option><option value=6>Trước đây 6 ngày</option></select></td><td style='border:1px solid'><h1 id='labNgayNghi'>"+self.now.toLocaleDateString()+"</h1></td></tr></table><table style='margin:auto'><caption><h3>Giải trình</h3></caption><tr><td align='right'>Nguyên nhân *</td><td>"+cbo.outerHTML+"</td></tr><tr><td align='right'>Lý do *</td><td><textarea id='txtLyDo'></textarea></td></tr><tr><td align='right'>Hình ảnh</td><td><input id='fileHinhAnh' type='file' onchange='Com_HrmsGiaiTrinhKhongCheckIn.fileHinhAnh_onChange()'/></td></tr></table><canvas id='canHinhAnh' width='500'></canvas>",
						buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Cancel</button><button class="w2ui-btn" onclick="Com_HrmsGiaiTrinhKhongCheckIn.guiGiaiTrinh()">✔️ Gửi</button>'
					});
				});
			}
		});
	},
	cboNgayNghi_onChange:function(val){
		this.ngayNghi=new Date(this.now);
		this.ngayNghi.setDate(this.ngayNghi.getDate()-parseInt(val));
		labNgayNghi.innerHTML=this.ngayNghi.toLocaleDateString();
	},
	fileHinhAnh_onChange:function(){
		var img=new Image();
		img.onload=function(){
			var ctx=canHinhAnh.getContext("2d");
			canHinhAnh.height=Math.round(this.height*canHinhAnh.width/this.width);
			ctx.drawImage(this,0,0,canHinhAnh.width,canHinhAnh.height);
		}
		img.src=URL.createObjectURL(fileHinhAnh.files[0]);
	},
	guiGiaiTrinh:function(){
		if(txtLyDo.value&&cboInOut_NguyenNhan.value){
			NUT_DS.select({url:this.urledit+"giaitrinh_v",select:"chamcong",where:[["nam","=",this.ngayNghi.getFullYear()],["thang","=",this.ngayNghi.getMonth()+1],["ngay","=",this.ngayNghi.getDate()],["madoitac","=",_context.user.ext],["manhanvien","=",_context.user.username]]},function(res){
				if(res.length){
					w2alert("Bạn đã giải trình ngày #"+labNgayNghi.innerHTML);
				}else{
					if(fileHinhAnh.value){
						canHinhAnh.toBlob(function(blob){
							var data=new FormData();
							data.append("anh",blob);
							w2popup.lock("Uploading...",true);
							NUT_DS.upload({url:"api/upload",data:data},function(fileNames){
								w2popup.unlock();
								if(fileNames.length)Com_HrmsGiaiTrinhKhongCheckIn.insertChamCong(fileNames[0]);
								else NUT.w2alert("Upload file error.");
							});
						});
						
					}else{
						if(cboInOut_NguyenNhan.value=="LoiDMS"||cboInOut_NguyenNhan.value=="LoiTab")w2alert("Lỗi thiết bị cần Upload hình ảnh để giải trình!");
						else Com_HrmsGiaiTrinhKhongCheckIn.insertChamCong();
					}
				}
			});
		}else w2alert("Nguyên nhân và Nhập lý do để giải trình!");
	},
	insertChamCong(hinhanh){
		var data={nam:this.ngayNghi.getFullYear(),thang:this.ngayNghi.getMonth()+1,ngay:this.ngayNghi.getDate(),madoitac:_context.user.ext,manhanvien:_context.user.username,nguyennhan:cboInOut_NguyenNhan.value,madiemban:"0",lan:0,makhuvuc:this.makhuvuc,lydo:txtLyDo.value,dulieu:-1};
		if(hinhanh)data.hinhanh=hinhanh;
		NUT_DS.upsert({url:_context.service["hrms"].urledit+"chamcong_v",data:data,keys:"madoitac,manhanvien,madiemban,nam,thang,ngay,lan,dulieu"},function(res){
			NUT.tagMsg("Records updated.","lime");
			w2popup.close();
		});
	}
}