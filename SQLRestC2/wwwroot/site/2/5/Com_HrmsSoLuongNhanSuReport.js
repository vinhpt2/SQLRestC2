var Com_HrmsSoLuongNhanSuReport={
	run:function(p){
		var items=_context.domain[24].items;
		var cbo=document.createElement("select");
		cbo.id="cboDoiTac";
		for(var i=0;i<items.length;i++){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Số lượng nhân sự</i>',
			modal:true,
			width: 400,
			height: 150,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td></tr><tr><td>Đối tác</td><td>"+cbo.outerHTML+"</td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsSoLuongNhanSuReport.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value){
			var nam=parseInt(numTinhCong_Year.value);
			var url=_context.service["hrms"].urledit;
			var html="client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/SoLuongNhanSu.html";
			var where=([["nambatdaulam","<=",nam],["or",["namthoiviec",">=",nam],["namthoiviec","is",null]]]);
			NUT_DS.select({url:url+"namthang_hopdonglaodong_v",where:where},function(hopdongs){
				var lookupHopDong={};
				for(var i=0;i<hopdongs.length;i++){
					var hd=hopdongs[i];
					lookupHopDong[hd.manhanvien]=hd;
				}
				NUT_DS.select({url:url+"rpt_soqlnhansu_thang",where:["nam","=",nam]},function(res){
					if(res.length){
						var win=window.open(html);
						win.onload=function(){
							this.labThangNam.innerHTML="NĂM "+nam;
							this.labDoiTac.innerHTML=(cboDoiTac.value?"Đơn vị đối tác: " + cboDoiTac.value:"");
							var chiTieus=["Số nhân viên BA","Hợp đồng trên 90 ngày","Số nhân viên BA đóng BHXH","Tăng mới BA","Giảm trừ BA","<b><i>Lũy kế BA</i></b>","<b><i>Lũy kế HĐ trên 90 ngày</i></b>","Số nhân viên SM","Hợp đồng trên 90 ngày","Số nhân viên SM đóng BHXH","Tăng mới SM","Giảm trừ SM","<b><i>Lũy kế SM</i></b>","<b><i>Lũy kế HĐ trên 90 ngày</i></b>","Số nhân viên Văn phòng","Hợp đồng trên 90 ngày","Số nhân viên Văn phòng đóng BHXH","Tăng mới VP","Giảm trừ VP","<b><i>Lũy kế VP</i></b>","<b><i>Lũy kế HĐ trên 90 ngày</i></b>","<b>Tổng số nhân sự</b>","<b>Hợp đồng trên 90 ngày</b>","<b>Tổng số nhân sự đóng BHXH</b>","<b>Tăng mới</b>","<b>Giảm trừ</b>","<b><i>Tổng lũy kế</i></b>","<b><i>Lũy kế HĐ trên 90 ngày</i></b>"];
							for(var i=0;i<chiTieus.length;i++){
								var row=this.tblData.insertRow();
								row.innerHTML="<td align='center'>"+(i+1)+"</td><td>"+chiTieus[i]+"</td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td>";
							}
							var sumDiLam={},sumBaoHiem={};
							for(var i=1;i<=12;i++){
								sumDiLam[i]={BA:0,SM:0,VP:0,tang:{BA:0,SM:0,VP:0},giam:{BA:0,SM:0,VP:0},hd90:{BA:0,SM:0,VP:0},hd90tang:{BA:0,SM:0,VP:0},hd90giam:{BA:0,SM:0,VP:0}};
								sumBaoHiem[i]={BA:0,SM:0,VP:0};
							}
							var tang=0, giam=0, row=null;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								var hd=lookupHopDong[rec.manhanvien];
								var tanggiam="",ngaythoiviec="",thamgia="",vitri="";
								if(hd){
									if(cboDoiTac.value&&cboDoiTac.value!=hd.madoitac)continue;
									vitri=hd.nhomvitri;
									var tren90=(new Date(hd.ngayketthuchd)-new Date(hd.ngaykyhd)>7776000000);
									if(hd.thangbatdaulam==rec.thang&&hd.nambatdaulam==rec.nam){
										sumDiLam[rec.thang].tang[vitri]++;
										if(tren90)sumDiLam[rec.thang].hd90tang[vitri]++;
									}
									if(hd.thangthoiviec==rec.thang&&hd.namthoiviec==rec.nam){
										sumDiLam[rec.thang].giam[vitri]++;
										if(tren90)sumDiLam[rec.thang].hd90giam[vitri]++;
									}
									if(tren90)sumDiLam[rec.thang].hd90[vitri]++;
								}
								if(vitri){
									sumDiLam[rec.thang][vitri]++;
									if(rec.sotien)sumBaoHiem[rec.thang][vitri]++;
								}
							}
							var luyke={BA:0,SM:0,VP:0},luykehd90={BA:0,SM:0,VP:0};
							for(var i=1;i<=12;i++){
								var c=i+1;
								this.tblData.rows[0].cells[c].innerHTML=sumDiLam[i].BA;
								this.tblData.rows[1].cells[c].innerHTML=sumDiLam[i].hd90.BA;
								this.tblData.rows[2].cells[c].innerHTML=sumBaoHiem[i].BA;
								this.tblData.rows[3].cells[c].innerHTML="+"+sumDiLam[i].tang.BA;
								this.tblData.rows[4].cells[c].innerHTML="-"+sumDiLam[i].giam.BA;
								luyke.BA+=(i==1?sumDiLam[i].BA:sumDiLam[i].tang.BA);
								this.tblData.rows[5].cells[c].innerHTML="<b><i>"+luyke.BA+"</i></b>";
								luykehd90.BA+=(i==1?sumDiLam[i].hd90.BA:sumDiLam[i].hd90tang.BA);
								this.tblData.rows[6].cells[c].innerHTML="<b><i>"+luykehd90.BA+"</i></b>";

								this.tblData.rows[7].cells[c].innerHTML=sumDiLam[i].SM;
								this.tblData.rows[8].cells[c].innerHTML=sumDiLam[i].hd90.SM;
								this.tblData.rows[9].cells[c].innerHTML=sumBaoHiem[i].SM;
								this.tblData.rows[10].cells[c].innerHTML="+"+sumDiLam[i].tang.SM;
								this.tblData.rows[11].cells[c].innerHTML="-"+sumDiLam[i].giam.SM;
								luyke.SM+=(i==1?sumDiLam[i].SM:sumDiLam[i].tang.SM);
								this.tblData.rows[12].cells[c].innerHTML="<b><i>"+luyke.SM+"</i></b>";
								luykehd90.SM+=(i==1?sumDiLam[i].hd90.SM:sumDiLam[i].hd90tang.SM);
								this.tblData.rows[13].cells[c].innerHTML="<b><i>"+luykehd90.SM+"</i></b>";
								
								this.tblData.rows[14].cells[c].innerHTML=sumDiLam[i].VP;
								this.tblData.rows[15].cells[c].innerHTML=sumDiLam[i].hd90.VP;
								this.tblData.rows[16].cells[c].innerHTML=sumBaoHiem[i].VP;
								this.tblData.rows[17].cells[c].innerHTML="+"+sumDiLam[i].tang.VP;
								this.tblData.rows[18].cells[c].innerHTML="-"+sumDiLam[i].giam.VP;
								luyke.VP+=(i==1?sumDiLam[i].VP:sumDiLam[i].tang.VP);
								this.tblData.rows[19].cells[c].innerHTML="<b><i>"+luyke.VP+"</i></b>";
								luykehd90.VP+=(i==1?sumDiLam[i].hd90.VP:sumDiLam[i].hd90tang.VP);
								this.tblData.rows[20].cells[c].innerHTML="<b><i>"+luykehd90.VP+"</i></b>";
								
								this.tblData.rows[21].cells[c].innerHTML="<b>"+(sumDiLam[i].BA+sumDiLam[i].SM+sumDiLam[i].VP)+"</b>";
								this.tblData.rows[22].cells[c].innerHTML="<b>"+(sumDiLam[i].hd90.BA+sumDiLam[i].hd90.SM+sumDiLam[i].hd90.VP)+"</b>";
								this.tblData.rows[23].cells[c].innerHTML="<b>"+(sumBaoHiem[i].BA+sumBaoHiem[i].SM+sumBaoHiem[i].VP)+"</b>";
								this.tblData.rows[24].cells[c].innerHTML="<b>+"+(sumDiLam[i].tang.BA+sumDiLam[i].tang.SM+sumDiLam[i].tang.VP)+"</b>";
								this.tblData.rows[25].cells[c].innerHTML="<b>-"+(sumDiLam[i].giam.BA+sumDiLam[i].giam.SM+sumDiLam[i].giam.VP)+"</b>";
								this.tblData.rows[26].cells[c].innerHTML="<b><i>"+(luyke.BA+luyke.SM+luyke.VP)+"</i></b>";
								this.tblData.rows[27].cells[c].innerHTML="<b><i>"+(luykehd90.BA+luykehd90.SM+luykehd90.VP)+"</i></b>";
							}
						}
					}else NUT.tagMsg("No data to report!","yellow");
				});
			});

		} else NUT.tagMsg("Nhập năm trước khi thực hiện!","yellow");
	}
}