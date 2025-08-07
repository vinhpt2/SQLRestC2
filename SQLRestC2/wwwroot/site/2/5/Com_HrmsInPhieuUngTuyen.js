var Com_HrmsInPhieuUngTuyen={
	run:function(p){
		var nv=p.records[0];
		if(nv){
			var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_PhieuUngTuyen.html");
			win.onload=function(){
				this.id1.innerHTML=_context.domain[14].lookup[nv.vitrilv]||"";
				this.id2.innerHTML=nv.idnhansu||"";
				this.id3.innerHTML=(_context.domain[9].lookup[nv.makhuvuc]||"")+" - "+(nv.diadiemlv||"");
				this.id4.innerHTML=w2utils.formatNumber(nv.thunhapchapnhan)||"";
				this.id5.innerHTML=w2utils.formatNumber(nv.thunhapmongmuon)||"";
				this.id7.innerHTML=(nv.hoten||"").toUpperCase();
				this.id6.innerHTML=NUT.dmy(nv.ngaybatdaulv)||"";
				this.id8.innerHTML=NUT.dmy(nv.ngaysinh)||"";
				this.id9.innerHTML=nv.noisinh||"";
				this.id10.innerHTML=nv.socmt||"";
				this.id11.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
				this.id12.innerHTML=nv.noicapcmt||"";
				if(nv.gioitinh)nv.gioitinh=="Nam"?this.c1.innerHTML='🗹':this.c2.innerHTML='🗹';
				this.id13.innerHTML=nv.chieucao||"";
				this.id14.innerHTML=nv.cannang||"";
				if(nv.tthonnhan)nv.tthonnhan=="Chua"?this.c3.innerHTML='🗹':(nv.tthonnhan=="Da"?this.c4.innerHTML='🗹':this.c5.innerHTML='🗹');
				this.id16.innerHTML=nv.dienthoai||"";
				this.id18.innerHTML=nv.email||"";
				this.id19.innerHTML=nv.diachitt||"";
				this.id20.innerHTML=nv.noio||"";
				if(nv.ngoaingu&&nv.trinhdongoaingu)nv.ngoaingu=="Anh"?this.a1.innerHTML=this.a2.innerHTML=this.a3.innerHTML=this.a4.innerHTML=nv.trinhdongoaingu:this.a5.innerHTML=this.a6.innerHTML=this.a7.innerHTML=this.a8.innerHTML=nv.trinhdongoaingu;
				if(nv.trinhdomaytinh)nv.trinhdomaytinh=="ThanhThao"?this.b1.innerHTML=this.b4.innerHTML="✓":(nv.trinhdomaytinh=="CoBan"?this.b2.innerHTML=this.b5.innerHTML="✓":this.b3.innerHTML=this.b6.innerHTML="✓");
				if(nv.kehoachbanthan=="OnDinh")this.c6.innerHTML='🗹';
				if(nv.kehoachbanthan=="HocCaoHon")this.c7.innerHTML='🗹';
				if(nv.kehoachbanthan=="DuHoc")this.c10.innerHTML='🗹';
				if(nv.kehoachbanthan=="ThayDoiViec")this.c13.innerHTML='🗹';
				this.id31.innerHTML=nv.kehoachkhac||"";
				this.id32.innerHTML=nv.sothich||"";
				this.id33.innerHTML=nv.kynangkhac||"";
				this.id34.innerHTML=nv.uunhuocdiem||"";
				this.id35.innerHTML=nv.thamgiadoanthe||"";
				
				if(nv.hotenbo)this.tblQhgd.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+nv.hotenbo+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>Bố</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+(nv.nghenghiepbo||"")+" - "+(nv.donvicongtacbo||"")+"</td><td style='border:1px solid;font-size:11pt;text-align:center'></td>"
				if(nv.hotenme)this.tblQhgd.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+nv.hotenme+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>Mẹ</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+(nv.nghenghiepme||"")+" - "+(nv.donvicongtacme||"")+"</td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
				if(nv.hotenvo)this.tblQhgd.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+nv.hotenvo+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>Vợ/Chồng</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+(nv.nghenghiepvo||"")+" - "+(nv.donvicongtacvo||"")+"</td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
				
				if(!(nv.hotenbo||nv.hotenme||nv.hotenvo))for(var i=0;i<3;i++)this.tblQhgd.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>&nbsp;</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
				
				this.id36.innerHTML=nv.nguoilh||"";
				this.id38.innerHTML=nv.dienthoainguoilh||"";
				this.id39.innerHTML=nv.diachitt||"";
				
				nv.lamngoaigio?this.c14.innerHTML='🗹':this.c15.innerHTML='🗹';
				nv.dicongtac?this.c16.innerHTML='🗹':this.c17.innerHTML='🗹';
				nv.thaydoicholam?this.c18.innerHTML='🗹':this.c19.innerHTML='🗹';
				nv.daungtuyen?this.c20.innerHTML='🗹':this.c21.innerHTML='🗹';
				if(nv.daungtuyen)this.id40.innerHTML=nv.noidungdaungtuyen||"";
				
				if(nv.nguonungtuyen){
					if(nv.nguonungtuyen=="QuangCao")this.c22.innerHTML='🗹';
					else if(nv.nguonungtuyen=="Website")this.c23.innerHTML='🗹';
					else if(nv.nguonungtuyen=="HABECO")this.c24.innerHTML='🗹';
					else this.c25.innerHTML='🗹';
				}
				
				NUT_DS.select({url:_context.service["hrms"].urledit+"daotao",where:["idnhansu","=",nv.idnhansu]},function(res){
					if(res.length){
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							var tbl=null;
							if(rec.hocvan=="THPT"||rec.hocvan=="THCS")tbl=win.tblTH;
							if(rec.hocvan=="TrenDaiHoc"||rec.hocvan=="DaiHoc"||rec.hocvan=="CaoDang"||rec.hocvan=="TrungCap")tbl=win.tblDH;
							if(rec.hocvan=="HocNghe")tbl=win.tblNghe;
							
							if(tbl)tbl.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.tunam+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.dennam+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+(tbl==win.tblTH?rec.tentruong:rec.chuyennganh+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.tentruong)+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.tinhthanh+"</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'>"+_context.domain[46].lookup[rec.loaitotnghiep]+"</td>";
						}
					}else{
						for(var i=0;i<3;i++){
							win.tblTH.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>&nbsp;</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
							win.tblDH.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>&nbsp;</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
							win.tblNghe.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>&nbsp;</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
						}
					}
				});
				
				NUT_DS.select({url:_context.service["hrms"].urledit+"kinhnghiem",where:["idnhansu","=",nv.idnhansu]},function(res){
					var len=res.length||3
					var html=win.tblKinhNghiem.outerHTML;
					for(var i=1;i<len;i++){
						var div=document.createElement("div");
						win.divKinhNghiem.appendChild(div);
						div.outerHTML="<br/>"+html;
					}
					if(res.length){
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							(win.id21[i]||win.id21).innerHTML=rec.tendoanhnghiep||"";
							(win.id22[i]||win.id22).innerHTML=rec.chucdanh||"";
							(win.id23[i]||win.id23).innerHTML=rec.trachnhiemchinh||"";
							
							(win.id24[i]||win.id24).innerHTML=rec.thanhtich||"";
							(win.id26[i]||win.id26).innerHTML=NUT.dmy(rec.tungay)||"";
							(win.id27[i]||win.id27).innerHTML=NUT.dmy(rec.denngay)||"";
							
							(win.id28[i]||win.id28).innerHTML= w2utils.formatNumber(rec.thunhapthang)||"";
							(win.id29[i]||win.id29).innerHTML=(rec.quanlytructiep||"")+" - "+(rec.chucvuquanly||"");
							(win.id30[i]||win.id30).innerHTML=rec.lydonghiviec||"";
							
							win.tblThamKhao.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+(i+1)+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.quanlytructiep+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.chucvuquanly+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.tendoanhnghiep+"</td><td style='border:1px solid;font-size:11pt;text-align:center'>"+rec.dienthoaiquanly+"</td>";
						}
					}else{
						for(var i=0;i<3;i++)win.tblThamKhao.insertRow().innerHTML="<td style='border:1px solid;font-size:11pt;text-align:center'>"+(i+1)+"</td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td><td style='border:1px solid;font-size:11pt;text-align:center'></td>";
					}
				});
				
				//this.print();
			}
		} else NUT.tagMsg("Chọn một ứng viên để in phiếu!","yellow");
	}
}