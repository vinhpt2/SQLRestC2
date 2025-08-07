var RptSoChiTietTaiKhoan={
	run:function(p){
		RptSoChiTietTaiKhoan.url = NUT.services[3].url;
		var items=NUT.dmlinks[163].items;
		var cboTK=document.createElement("select");
		cboTK.id="cboTaiKhoan";
		cboTK.className='w2ui-input';
		cboTK.style.width="300px";
		cboTK.add(document.createElement("option"));
		for(var i=0;i<items.length;i++){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].id+" - "+items[i].text;
			cboTK.add(opt);
		}
		
		items=NUT.dmlinks[169].items;
		var cbo=document.createElement("select");
		cbo.id="cboDoiTac";
		cbo.className='w2ui-input';
		cbo.style.width="120px";
		cbo.add(document.createElement("option"));
		for(var i=0;i<items.length;i++){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].id+" - "+items[i].text;
			cbo.add(opt);
		}
		cbo.setAttribute("onchange", "RptSoChiTietTaiKhoan.cboDoiTac_onClick(this.value)");
		NUT.ds.select({url:RptSoChiTietTaiKhoan.url+"data/NHAN_VIEN",where:[1,"=",1]},function(res){
			if(res.success){
				var cbo2=document.createElement("select");
				cbo2.id="cboNhanVien";
				cbo2.style.display="none";
				cbo2.className='w2ui-input';
				cbo2.add(document.createElement("option"));
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					var opt=document.createElement("option");
					opt.value=rec.MA_NHAN_VIEN;
					opt.innerHTML=rec.HO_TEN;
					cbo2.add(opt);
				}
				var str=cboTK.outerHTML;
				cboTK.id="cboTKDoiUng";
				var str2=cboTK.outerHTML;
				var now=(new Date()).toISOString().substring(0,10);
				NUT.w2popup.open({
					title: '📜 <i>Sổ chi tiết tài khoản</i>',
					modal:true,
					width: 400,
					height: 280,
					body: "<table style='margin:auto'><caption><b><input id='chkTheoNhanVien' type='checkbox' class='w2ui-input' onchange='cboDoiTac.style.display=(this.checked?\"none\":\"\");cboNhanVien.style.display=(this.checked?\"\":\"none\")'/><label for='chkTheoNhanVien'>Theo nhân viên</label></b></caption><tr><td>Tài khoản</td><td colspan='3'>"+str+"</td></tr><tr><td>TK đối ứng</td><td colspan='3'>"+str2+"</td></tr><tr><td>Đối tác</td><td>"+cbo.outerHTML+cbo2.outerHTML+"</td><td>Dự án</td><td><select id='cboDuAn' class='w2ui-input' style='width:120px'></select></td></tr><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date' class='w2ui-input' value='"+now+"'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date' class='w2ui-input'/></td></tr></table>",
					actions: {
						"_Close": function () {
							NUT.w2popup.close();
						},
						"_Ok": function () {
							if(datTuNgay.value){
								var where=[["ngay_thanh_toan","<",datTuNgay.value]];
								if(cboTaiKhoan.value)where.push(["ma_tai_khoan","like",cboTaiKhoan.value+"%"]);
								if(cboTKDoiUng.value)where.push(["tk_doi_ung","like",cboTKDoiUng.value+"%"]);
								if(!chkTheoNhanVien.checked&&cboDoiTac.value)where.push(["ma_doi_tac","=",cboDoiTac.value]);
								if(chkTheoNhanVien.checked&&cboNhanVien.value)where.push(["ma_nhan_vien","=",cboNhanVien.value]);
								if(cboDuAn.value)where.push(["ma_du_an","=",cboDuAn.value]);
							
								NUT.ds.select({url:RptSoChiTietTaiKhoan.url+"data/thanh_toan",select:"sum(giao_dich*gia_tri) TON",where:where},function(res2){
									var tonTk=res2.result.length?res2.result[0].TON||0:0;
									where = [["ngay_thanh_toan",">=",datTuNgay.value]];
									if(cboTaiKhoan.value)where.push(["ma_tai_khoan", "like", cboTaiKhoan.value+"%"]);
									if(datDenNgay.value)where.push(["ngay_thanh_toan","<=",datDenNgay.value]);
									if(cboTKDoiUng.value)where.push(["tk_doi_ung","like",cboTKDoiUng.value+"%"]);
									if(!chkTheoNhanVien.checked&&cboDoiTac.value)where.push(["ma_doi_tac","=",cboDoiTac.value]);
									if(chkTheoNhanVien.checked&&cboNhanVien.value)where.push(["ma_nhan_vien","=",cboNhanVien.value]);
									if(cboDuAn.value)where.push(["ma_du_an","=",cboDuAn.value]);
										
									NUT.ds.select({url:RptSoChiTietTaiKhoan.url+"data/thanh_toan",orderby:"id_thanh_toan",where:where,limit:NUT.QUERY_LIMIT},function(res){
										if(res.success&&res.result.length){
											var win=window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/RptSoChiTietTaiKhoan.html");
											win.onload=function(){
												this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
												this.labTaiKhoan.innerHTML=cboTaiKhoan.value;
												this.labTKDoiUng.innerHTML=cboTKDoiUng.value;
												this.labDoiTac.innerHTML=cboDoiTac.value;
												this.labNhanVien.innerHTML=cboNhanVien.value;
												this.labDuAn.innerHTML=cboDuAn.value;
												this.labTonTk.innerHTML=tonTk.toLocaleString();
												var tongThu=0,tongChi=0;
												for(var i=0;i<res.result.length;i++){
													var rec=res.result[i];
													tonTk+=rec.GIAO_DICH*rec.GIA_TRI;
													if(rec.GIAO_DICH==1)tongThu+=rec.GIA_TRI;
													else tongChi+=rec.GIA_TRI;
													var row=this.tblData.insertRow();
													row.innerHTML="<td align='center'>"+(i+1)+"</td><td>"+rec.NGAY_THANH_TOAN.substring(0,10)+"</td><td align='center'>"+(rec.MA_TAI_KHOAN||"")+"</td><td>"+(rec.MA_QUY||"")+"</td><td>"+(rec.SO_CHUNG_TU||"")+"</td><td>"+(rec.GHI_CHU||"")+"</td><td>"+(rec.MA_DOI_TAC||"")+"</td><td>"+(rec.MA_DU_AN||"")+"</td><td align='right'>"+(rec.GIAO_DICH==-1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+(rec.GIAO_DICH==1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+tonTk.toLocaleString()+"</td>";
												}
												var row=this.tblData.insertRow();
												row.innerHTML="<th colspan='8'>TỔNG</th><th align='right'>"+tongChi.toLocaleString()+"</th><th align='right'>"+tongThu.toLocaleString()+"</th><th align='right'>"+tonTk.toLocaleString()+"</th>";
											}
										} else NUT.notify("⚠️ No data to report!","yellow");
									});
								});
							}else NUT.notify("⚠️ Select from date!","yellow"); 
						},
					}
				});
			}else NUT.notify("⛔ ERROR: " + res.result, "red");
		});
	},
	cboDoiTac_onClick:function(val){
		NUT.ds.select({url:RptSoChiTietTaiKhoan.url+"data/DU_AN",order:"MA_DU_AN",where:["ma_doi_tac","=",val]},function(res){
			cboDuAn.add(document.createElement("option"));
			for(var i=0;i<res.result.length;i++){
				var rec=res.result[i];
				var opt=document.createElement("option");
				opt.value=rec.MA_DU_AN;
				opt.innerHTML=rec.MA_DU_AN+" - "+rec.MA_DOI_TAC;
				cboDuAn.add(opt);
			}
		});
	}
}