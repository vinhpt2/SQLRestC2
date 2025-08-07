var InHopDongLaoDong={
	run: function (p) {
		InHopDongLaoDong.url = NUT.services[2].url;
		if(p){
			if(p.records.length){
				for (var i = 0; i < p.records.length; i++)InHopDongLaoDong.inHopDong(p.records[i]);
			} else NUT.notify("⚠️ Không có bản ghi nào được chọn!","yellow");
		} else NUT.ds.select({ url: InHopDongLaoDong.url +"data/hopdonglaodong",orderby:"ngaykyhd desc",where:["manhanvien","=",n$.user.username]},function(res){
			InHopDongLaoDong.inHopDong(res.result[0],true);
		});
	},
	inHopDong:function(hd,full){
		NUT.ds.select({ url: InHopDongLaoDong.url +"data/dm_vitrilv",where:["vitrilv","=",hd.vitrilamviec]},function(res2){
			if (res2.success && res2.result.length){
				var dm=res2.result[0];
				NUT.ds.select({ url: InHopDongLaoDong.url +"data/nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
					if(res.success && res.result.length){
						var nv=res.result[res.result.length-1];
						var win_hd = window.open("site/" + n$.user.siteid + "/" + n$.app.appid +"/In_HopDongLaoDong.html");
						win_hd.onload=function(){
							if(hd.loaihopdong=="GiaoKhoan") this.hd_partime.innerHTML="(Hợp đồng lao động bán thời gian)";
							else if(hd.loaihopdong=="ThuViec"){
								this.hd_partime.innerHTML="(Hợp đồng thử việc)";
								hd.ngaykyhd=hd.ngaybatdaulamviec;
								hd.ngayketthuchd=(new Date((new Date(hd.ngaybatdaulamviec)).getTime()+27*86400000)).toISOString().substr(0,10);
							}
							
							var ymd=hd.ngaykyhd?hd.ngaykyhd.split("-"):["","",""];
							
							//hopdong
							this.hd_sohopdong.innerHTML="Số "+(nv.sohoso||"........")+"/"+(ymd[0]||"....")+"/HĐLĐ-"+hd.vitrilamviec;
							this.hd_ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
							this.hd_hoten.innerHTML=nv.hoten||"";
							this.hd_hoten2.innerHTML=(full?"":nv.hoten||"");
							this.hd_quoctich.innerHTML=NUT.domain[22].lookup[nv.quoctich][1]||"";
							this.hd_ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
							this.hd_gioitinh.innerHTML=NUT.domain[20].lookup[nv.gioitinh][1]||"";
							this.hd_noio.innerHTML=nv.noio||"";
							this.hd_diachi.innerHTML=nv.diachitt||"";
							this.hd_socmt.innerHTML=nv.socmt||"";
							this.hd_ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
							this.hd_noicapcmt.innerHTML=nv.noicapcmt||"";
							
							this.hd_loaihopdong.innerHTML=NUT.domain[37].lookup[hd.loaihopdong][1]||"";

							this.hd_ngaykyhd.innerHTML=NUT.dmy(hd.ngaykyhd)||"";
							this.hd_ngayketthuchd.innerHTML=NUT.dmy(hd.ngayketthuchd)?" đến hến hết ngày " + NUT.dmy(hd.ngayketthuchd):"";
							this.hd_diadiemlv.innerHTML = (nv.diadiemlv || "") + " - " + (NUT.domain[9].lookup[nv.makhuvuc][1]||"");
							this.hd_vitrilv.innerHTML = NUT.domain[14].lookup[hd.vitrilamviec][1]||"";
							
							this.hd_luongcoban.innerHTML=dm.mucluongcoban||"";
							this.hd_phucapxangxe.innerHTML=dm.phucapxangxe||"";
							this.hd_phucapdienthoai.innerHTML=dm.phucapdienthoai||"";
							
							this.hd_phucapanca.innerHTML=(full?"":dm.phucapanca||"");
							this.hd_thoihantraluong.innerHTML=(full?"":dm.thoihantraluong||"");
							this.hd_thoigianlamviec.innerHTML=(full?"":dm.thoigianlamviec||"");

							if(full){
								//tncn
								this.tn_hoten.innerHTML=nv.hoten||"";
								this.tn_noio.innerHTML=nv.noio||"";
								this.tn_namhd.innerHTML=ymd[0]||"........";
								if(nv.masothue){
									this.tn_o1.innerHTML=nv.masothue[0]||"";
									this.tn_o2.innerHTML=nv.masothue[1]||"";
									this.tn_o3.innerHTML=nv.masothue[2]||"";
									this.tn_o4.innerHTML=nv.masothue[3]||"";
									this.tn_o5.innerHTML=nv.masothue[4]||"";
									this.tn_o6.innerHTML=nv.masothue[5]||"";
									this.tn_o7.innerHTML=nv.masothue[6]||"";
									this.tn_o8.innerHTML=nv.masothue[7]||"";
									this.tn_o9.innerHTML=nv.masothue[8]||"";
									this.tn_o10.innerHTML=nv.masothue[9]||"";
									
									this.tn_o11.innerHTML=nv.masothue[10]||"";
									this.tn_o12.innerHTML=nv.masothue[11]||"";
									this.tn_o13.innerHTML=nv.masothue[12]||"";
									this.tn_o14.innerHTML=nv.masothue[13]||"";
								}
								this.tn_ngaythangnam.innerHTML=this.hd_ngaythangnam.innerHTML;
								
								//camket
								this.ck_hoten.innerHTML=nv.hoten||"";
								this.ck_ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
								this.ck_noio.innerHTML=nv.noio||"";
								this.ck_socmt.innerHTML=nv.socmt||"";
								this.ck_ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
								this.ck_noicapcmt.innerHTML=nv.noicapcmt||"";				
								this.ck_vitrilv.innerHTML = NUT.domain[14].lookup[nv.vitrilv][1]||"";
								this.ck_vitrilv2.innerHTML = NUT.domain[14].lookup[nv.vitrilv][1]||"";
								var isPG=(nv.vitrilv=="BA")||"";
								this.ck_dieu2PG.style.display=(isPG?"":"none");
								this.ck_dieu2SM.style.display=(isPG?"none":"");
								this.ck_ngaythangnam.innerHTML=this.hd_ngaythangnam.innerHTML;
							} else {
								this.divCKTNCN.outerHTML="";
								this.divCamKetNV.outerHTML="";
							}
							if(!full)this.print();
						}
					} else NUT.notify("⚠️ Không có dữ liệu hợp đồng!","yellow");
				});
			} else NUT.notify("⚠️ Không tồn tại vị trí làm việc trong danh mục " +hd.vitrilamviec,"yellow");
		});
	}
}