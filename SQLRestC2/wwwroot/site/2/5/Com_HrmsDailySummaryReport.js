var Com_HrmsDailySummaryReport={
	run:function(p){
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Daily Summary Report</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(_context.user.kvhcs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cboTinhCong_ViTriLv'><option value='BA' selected>BA</option><option value='BA_'>BA_PartTime</option></select></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsDailySummaryReport.runReport()">✔️ Report</button>'
		});
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var vitrilv=cboTinhCong_ViTriLv.value;
			var nam=numTinhCong_Year.value;
			var thang=numTinhCong_Month.value;
			var date=nam+"-"+thang+"-15";
			var url=_context.service["hrms"].urledit;
			NUT_DS.select({url:url+"chucvu_v",where:[["machucvu","in","TF,TL,GDCN"],(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value]),["or",["ngaybatdau","is","null"],["ngaybatdau","<=",date]],["or",["ngayketthuc","is","null"],["ngayketthuc",">=",date]]]},function(cvs){
				var lookupTL={},lookupTF={},gdcn=null;
				for(var i=0;i<cvs.length;i++){
					var cv=cvs[i];
					if(cv.machucvu=="TL")lookupTL[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="TF")lookupTF[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="GDCN")gdcn=cv.hoten;
				}
				NUT_DS.select({url:url+"rpt_sumchitieu",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value])]},function(chitieu){
					var lookupChiTieu={};
					for(var i=0;i<chitieu.length;i++)lookupChiTieu[chitieu[i].makhuvuc]=chitieu[i];
					NUT_DS.select({url:url+"rpt_dailysummary",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value]),(vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"]),["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
						if(res.length){
							var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/DailySummaryReport.html");
							win.onload=function(){
								this.labGDCN.innerHTML=gdcn;
								this.labThangNam.innerHTML=thang+"/"+nam;
								this.labThiTruong.innerHTML=_context.user.kvhcs.length?_context.user.kvhcnames:cboTinhCong_ThiTruong.value;
								this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
								var sumba=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
								var sumsl=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
								var total=[0,0,0,0,0,0,0,0,0,0];
								var lookupKhuVuc=_context.domain[9].lookup;
								for(var i=0;i<res.length;i++){
									var rec=res[i];
									
									row=this.tblData.insertRow();
									row.innerHTML="<td align='center'>"+(i+1)+"</td><td class='frozen'>"+lookupKhuVuc[rec.makhuvuc]+"</td>";
									for(var j=1;j<=31;j++){
										var cell=row.insertCell();
										cell.align="center";
										cell.innerHTML=rec["ba"+j];
										sumba[j]+=rec["ba"+j];
										cell=row.insertCell();
										cell.align="center";
										cell.innerHTML=Math.round(10*rec["sl"+j])/10;
										sumsl[j]+=rec["sl"+j];
									}
									var ct=lookupChiTieu[rec.makhuvuc]||{khoansanluong:0,khoantrongdiem:0};
									row.innerHTML+="<td align='center'>"+rec.ba+"</td><td align='center'>"+rec.ba*26+"</td><td align='center'>"+rec.nc+"</td><td align='center'>"+Math.round(100*rec.nc/(rec.ba*26))+"%</td><td align='center'>"+ct.khoansanluong+"</td><td align='center'>"+Math.round(10*rec.sl)/10+"</td><td align='center'>"+(ct.khoansanluong?Math.round(100*rec.sl/ct.khoansanluong)+"%":"-/-")+"</td><td align='center'>"+ct.khoantrongdiem+"</td><td align='center'>"+Math.round(10*rec.sltrongdiem)/10+"</td><td align='center'>"+(ct.khoantrongdiem?Math.round(100*rec.sltrongdiem/ct.khoantrongdiem)+"%":"-/-")+"</td>";
									total[0]+=rec.ba;
									total[1]+=rec.ba*26;
									total[2]+=rec.nc;
									//total[3]+=
									total[4]+=ct.khoansanluong;
									total[5]+=rec.sl;
									//total[6]+=
									total[7]+=ct.khoantrongdiem;
									total[8]+=rec.sltrongdiem;
								}
								row=this.tblData.insertRow();
								row.innerHTML="<th></th><th class='frozen'>Tổng cộng</th>";
								for(var j=1;j<=31;j++){
									row.insertCell().innerHTML="<b>"+sumba[j]+"</b>";
									row.insertCell().innerHTML="<b>"+Math.round(10*sumsl[j])/10+"</b>";
								}
								for(var i=0;i<total.length;i++){
									row.insertCell().innerHTML="<b>"+(total[i]?Math.round(10*total[i])/10:"-/-")+"</b>";
								}
							}
						} else NUT.tagMsg("No data to report!","yellow");
					});
				});
			});
			
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}