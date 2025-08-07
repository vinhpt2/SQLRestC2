var InQuyetDinhChamDutHD={
	run:function(p){
		InQuyetDinhChamDutHD.url = NUT.services[2].url;
		if (p) {
			if (p.records.length) {
				for (var i = 0; i < p.records.length; i++)InQuyetDinhChamDutHD.inQuyetDinh(p.records[i]);
			} else NUT.notify("⚠️ Không có bản ghi nào được chọn!", "yellow");
		} else NUT.ds.select({ url: InQuyetDinhChamDutHD.url + "data/hopdonglaodong", orderby: "ngaykyhd desc", where: ["manhanvien", "=", n$.user.username] }, function (res) {
			InQuyetDinhChamDutHD.inQuyetDinh(res.result[0], true);
		});
	},
	inQuyetDinh:function(hd){
		NUT.ds.select({ url: InQuyetDinhChamDutHD.url +"data/nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if (res.success && res.result.length) {
				var nv = res.result[res.result.length - 1];
				var win_hd = window.open("site/" + n$.user.siteid + "/" + n$.app.appid +"/In_QuyetDinhChamDutHD.html");
				win_hd.onload=function(){
					var ymd=hd.ngaythoiviec?hd.ngaythoiviec.split("-"):["","",""];
					
					//hopdong
					this.hd_sohopdong.innerHTML="Số: "+(nv.sohoso||"........")+"/"+(ymd[0]||"....")+"/QĐNV-"+nv.vitrilv;
					this.hd_ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hd_hoten1.innerHTML=this.hd_hoten2.innerHTML=this.hd_hoten3.innerHTML=this.hd_hoten4.innerHTML=this.hd_hoten5.innerHTML=this.hd_hoten6.innerHTML=this.hd_hoten7.innerHTML=(nv.gioitinh=="Nu"?"Bà ":"Ông ")+nv.hoten||"";
					//this.hd_quoctich.innerHTML=_context.domain[22].lookup[nv.quoctich][1]||"";
					this.hd_ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					//this.hd_gioitinh.innerHTML=_context.domain[20].lookup[nv.gioitinh][1]||"";
					//this.hd_noio.innerHTML=nv.noio||"";
					this.hd_diachitt.innerHTML=nv.diachitt||"";
					this.hd_socmt.innerHTML=nv.socmt||"";
					//this.hd_ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
					//this.hd_noicapcmt.innerHTML=nv.noicapcmt||"";
					this.hd_dienthoai.innerHTML=nv.dienthoai||"";
					this.hd_ngayqd.innerHTML=this.hd_ngayqd2.innerHTML=NUT.dmy(hd.ngaythoiviec)||"";
					//this.hd_diadiemlv.innerHTML=(nv.diadiemlv||"")+" - "+(_context.domain[9].lookup[nv.makhuvuc][1]||"");
					this.hd_vitrilv.innerHTML = this.hd_vitrilv2.innerHTML = NUT.dmlinks[147].lookup[nv.vitrilv][1]||"";
					
					//this.print();
				}
			} else NUT.notify("⚠️ Không có dữ liệu hợp đồng!", "yellow");
		});
	}
}