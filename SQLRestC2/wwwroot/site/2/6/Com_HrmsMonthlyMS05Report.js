var Com_HrmsMonthlyMS05Report={
	run:function(p){
		var items=_context.domain[24].items;
		var cbo=document.createElement("select");
		cbo.id="cboTinhCong_DoiTac";
		cbo.style.width="100%";
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Monthly MS05-Bảng lương KPI tháng</i>',
			modal:true,
			width: 320,
			height: 160,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox' checked/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS05Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var url=_context.service["hrms"].urledit;
			NUT.ds.select({url:url+"phucap",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["vitrilv","=","PG"]]},function(phucaps){
				if(phucaps.length)NUT.ds.select({url:url+"rpt_monthlysum",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=",cboTinhCong_DoiTac.value],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
					if(res.length){
						var pcPG=phucaps[0];
						var win=window.open("client/"+_context.user.siteid+"/html/MonthlyMS05Report.html");
						win.onload=function(){
							this.labThangNam.innerHTML=numTinhCong_Year.value+"/"+numTinhCong_Month.value;
							var oldMaNhanVien=null;
							var row=null;
							var sum=0;
							var total=[];
							var grandTotal=0;
							var c=[];
							c[5]="";c[6]="";c[7]="";c[11]=0;c[19]=0;c[20]=0;c[23]=0;c[24]=0;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								if(rec.manhanvien!=oldMaNhanVien){
									if(oldMaNhanVien){
										row=this.tblData.insertRow();
										for(var j=0;j<c.length;j++){
											var cell=row.insertCell();
											cell.innerHTML=c[j];
										}
										c[5]="";c[6]="";c[7]="";c[11]=0;c[19]=0;c[20]=0;c[23]=0;c[24]=0;
									}
									oldMaNhanVien=rec.manhanvien;
									sum=0;
								}
								c[0]=i+1;
								c[1]=rec.quanlytructiep;
								c[2]=rec.hoten;
								c[3]=rec.sohoso;
								c[4]=rec.loaihinh;
								c[5]+=rec.tendiemban+"\\";
								c[6]+=rec.sonha+"\\";
								c[7]+=rec.duong+"\\";
								c[8]=rec.huyen;
								c[9]=rec.makhuvuc;
								c[10]=pcPG.ngaycongthang;
								c[11]+=rec.ngaycong;
								var tilengay=(c[11]<c[10]?c[11]/c[10]:1);
								c[12]=Math.round(tilengay*pcPG.luongcoban);
								c[13]=Math.round(tilengay*pcPG.pcchuyencan);
								c[14]=Math.round(tilengay*pcPG.pcxangxe);
								c[15]=Math.round(tilengay*pcPG.pctrangdiem);
								c[16]=Math.round(tilengay*pcPG.pcdienthoai);
								c[17]=Math.round(tilengay*rec.pcdiemban);
								c[18]=Math.round(tilengay*(pcPG.pcchuyencan+pcPG.pcxangxe+pcPG.pctrangdiem+pcPG.pcdienthoai+rec.pcdiemban));
								//var sanluong=Math.round(rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24+rec.trucbach/24+rec.trucbachl/24+rec.hanoipre/20+rec.hanoiprel/24);
								var sanluong=Math.round(rec.bold+rec.boldl+rec.light+rec.lightl+rec.trucbach+rec.trucbachl+rec.hanoipre+rec.hanoiprel);
								c[19]+=rec.sanluongkhoan;
								c[20]+=sanluong;
								c[21]=c[19]?Math.round(100*c[20]/c[19]):0;
								c[22]=Math.round(eval(pcPG.kpi1));
								//var trongdiem=Math.round(rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24);
								var trongdiem=Math.round(rec.bold+rec.boldl+rec.light+rec.lightl);
								c[23]+=rec.sltrongdiem;
								c[24]+=trongdiem;
								c[25]=c[23]?Math.round(100*c[24]/c[23]):0;
								c[26]=Math.round(eval(pcPG.kpi2));
								c[27]=Math.round(eval(pcPG.kpi3));
								c[28]=10000*c[27];
								c[29]=c[12]+c[18]+c[22]+c[26]+c[28];
							}
							if(row){
								row=this.tblData.insertRow();
								for(var j=0;j<c.length;j++){
									var cell=row.insertCell();
									cell.innerHTML=c[j];
								}
							}
							/*if(row){
								row.cells[41].innerHTML=sum;
								grandTotal+=sum;
							}
							row=this.tblData.insertRow();
							row.innerHTML="<td colspan='10' align='right'><b>Tổng cộng: </b></td>";
							for(var i=1;i<=32;i++){
								var cell=row.insertCell();
								cell.innerHTML="<b>"+(i==32?grandTotal:(total[i]?total[i]:""))+"</b>";
							}*/
						}
					} else NUT.tagMsg("No data to report!","yellow");
				});else NUT.tagMsg("Không có dữ liệu Phụ cấp "+numTinhCong_Year.value+"/"+numTinhCong_Month.value,"yellow");
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}