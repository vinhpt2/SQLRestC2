var Com_TnmtInTrichLucThua2={
	run:function(p){
		if(p.records.length){
			NUT.ds.select({url:p.config.urledit.replace("/thuadat", "/v_thongtinthuadat"),where:["thuadatid","=",p.records[0].thuadatid]},function(res){
				if(res.length){
					var thua=res[0];
					var img=p.gsmap.awBasic.urlExportImage("dc_thuadat","mahuyen="+thua.mahuyen+" and maxa="+thua.maxa+" and sohieutobando="+thua.sohieutobando+" and sothututhua="+thua.sothututhua);			
					var mathua=thua.mahuyen+"."+thua.maxa+"."+thua.sohieutobando+"."+thua.sothututhua;
					var win = window.open();
					var str="<table><tr><td colspan='2'><b><i><u>THỬA ĐẤT</u></i>: "+mathua+"</b></td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Quận/Huyện:&nbsp</td><td>"+ thua["mahuyen"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Phường/Xã:&nbsp</td><td>"+ thua["maxa"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Số tờ BĐ:&nbsp</td><td>"+ thua["sohieutobando"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Số thửa:&nbsp</td><td>"+ thua["sothututhua"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Diện tích:&nbsp</td><td>"+ thua["dientich"] + "&nbsp(m²)</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>MĐSD:&nbsp</td><td>"+ thua["mucdichsudungghep"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Quy hoạch:&nbsp</td><td>"+ thua["phuhopquyhoach"] + "</td></tr>" +
						"<tr><td colspan='2'><i><b><u>Giấy chứng nhận</u></b></i></td></tr>" + 
						"<tr><td style='text-align:right;vertical-align:top'>Số hiệu:&nbsp</td><td>"+ thua["sohieugiaychungnhan"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Mã vạch:&nbsp</td><td>"+ thua["mavach"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Ngày cấp:&nbsp</td><td>"+ (thua["ngayvaoso"]?new Date(thua["ngayvaoso"]).toLocaleDateString():"") + "</td></tr>" +
						"<tr><td colspan='2'><i><b><u>Chủ sử dụng</u></b></i></td></tr>" + 
						"<tr><td style='text-align:right;vertical-align:top'>" + (thua["gioitinh"]?"Ông":"Bà")  + ":&nbsp</td><td>"+ thua["hoten"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Năm sinh:&nbsp</td><td>"+ thua["namsinh"] + "</td></tr>" +
						"<tr><td style='text-align:right;vertical-align:top'>Địa chỉ:&nbsp</td><td>"+ thua["diachi"] + "</td></tr>";
						if(thua["hoten2"]){
							str+="<tr><td style='text-align:right;vertical-align:top'>và&nbsp" + (thua["gioitinh2"]?"Ông: ":"Bà: ")  + ":&nbsp</td><td>"+ thua["hoten2"] + "</td></tr>" +
							"<tr><td style='text-align:right;vertical-align:top'>Năm sinh:&nbsp</td><td>"+ thua["namsinh2"] + "</td></tr>" +
							"<tr><td style='text-align:right;vertical-align:top'>Địa chỉ:&nbsp</td><td>"+ thua["diachi2"] + "</td></tr>";
						}
						str+="<tr><td colspan='2'><i><b><u>Quy hoạch</u></b></i></td></tr><tr><td style='text-align:right;vertical-align:top'>Vi phạm:&nbsp</td><td>Không</td></tr></table>";
					win.document.write("<center><br/><h2>PHIẾU THÔNG TIN</h2><br/><table><tr><td align='center'>Sơ đồ thửa đất<br/><br/><img "+(img.size[0]>img.size[1]?"width":"height")+"='512' src='" + img.url + "'/><br/><br/>Tỷ lệ: 1/" + p.gsmap.awBasic.txtScale.value + "</td><td>&nbsp</td><td>" + str + "</td></tr></table></center>");
					win.document.title=mathua;
				}
			});
		}else NUT.tagMsg("Không có thửa nào được chọn!","yellow");
	}
}