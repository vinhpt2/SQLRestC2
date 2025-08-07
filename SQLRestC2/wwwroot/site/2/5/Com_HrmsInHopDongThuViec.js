var Com_HrmsInHopDongThuViec={
	run:function(p){
		var self=this;
		if(p){
			if(p.records.length)this.inHopDong(p.records[0]);
			else NUT.tagMsg("Không có bản ghi nào được chọn!","yellow");
		}else NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd.desc",where:["manhanvien","=",_context.user.username]},function(res){
			self.inHopDong(res[0]);
		});
	},
	inHopDong:function(hd){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if(res.length){
				var nv=res[res.length-1];
				var win_hd=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_HopDongThuViec.html");
				win_hd.onload=function(){
					var ymd=hd.ngaybatdaulamviec?hd.ngaybatdaulamviec.split("-"):["","",""];
					
					//hopdong
					this.hd_sohopdong.innerHTML="Số "+(nv.sohoso||"........")+"/"+(ymd[0]||"....")+"/HĐTV-"+hd.vitrilamviec;
					this.hd_ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hd_hoten.innerHTML=this.hd_hoten2.innerHTML=nv.hoten||"";
					this.hd_quoctich.innerHTML=_context.domain[22].lookup[nv.quoctich]||"";
					this.hd_ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					this.hd_gioitinh.innerHTML=_context.domain[20].lookup[nv.gioitinh]||"";
					this.hd_noio.innerHTML=nv.noio||"";
					//this.hd_diachi.innerHTML=nv.diachitt||"";
					this.hd_socmt.innerHTML=nv.socmt||"";
					this.hd_ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
					this.hd_noicapcmt.innerHTML=nv.noicapcmt||"";
					this.hd_sotaikhoan.innerHTML=nv.sotaikhoan||"";
					this.hd_nganhang.innerHTML=nv.nganhang||"";
					this.hd_diadiemlv.innerHTML=(nv.diadiemlv||"")+" - "+(_context.domain[9].lookup[nv.makhuvuc]||"");
					this.hd_vitrilv.innerHTML=_context.domain[14].lookup[hd.vitrilamviec]||"";
					
					if(hd.ngaybatdaulamviec){
						var d=new Date((new Date(hd.ngaybatdaulamviec)).getTime()+27*86400000)
						this.hd_tungay.innerHTML=NUT.dmy(hd.ngaybatdaulamviec)||"";
						this.hd_denngay.innerHTML=d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
					}
					this.print();
				}
			} else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
		});
	}
}