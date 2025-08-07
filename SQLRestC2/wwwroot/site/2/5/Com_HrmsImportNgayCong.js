var Com_HrmsImportNgayCong={
	run:function(p){
		this.isSM=(p=="SM");
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
		
		var id="divCom_HrmsImportChamCong";
		var fieldnames=["manhanvien","madiemban",1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,10 ,11 ,12 ,13 ,14 ,15 ,16 ,17 ,18 ,19 ,20 ,21 ,22 ,23 ,24 ,25 ,26 ,27 ,28 ,29 ,30 ,31];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Import Ngày công từ Excel</i>",
			modal:true,
			width: 1000,
			height: 750,
			body: "<textarea cols="+(header.length+8*fieldnames.length)+" id='"+id+"' style='height:95%'>"+header+"</textarea><table style='margin:auto'><tr><td>Đối tác</td><td>"+cbo.outerHTML+"</td><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number'/></td><td>"+(this.isSM?"":"<input id='chkTinhCong_Edit' type='checkbox' checked/></td><td><label for='chkTinhCong_Edit'>Ghi vào dữ liệu Hiệu chỉnh</label>")+"</td><td><b style='color:red'>(Dữ liệu CŨ sẽ bị ghi đè!)</b></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsImportNgayCong.insert('+id+'.value)">✔️ Import</button>'
		});
	},
	insert:function(csv){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var lines=csv.split("\n");
			if(lines.length<2){
				NUT.tagMsg("Empty data","yellow");
			}else{
				var dulieu=-1;
				if(!this.isSM)dulieu=(chkTinhCong_Edit.checked?1:0);
				var madoitac=cboTinhCong_DoiTac.value;
				var line0=lines[0].split("\t");
				var header={};
				for(var i=0;i<line0.length;i++)
					header[line0[i]]=i;
				var data=[];
				for(var i=1;i<lines.length;i++){
					var cols=lines[i].split("\t");
					var json=null;
					for(var j=0;j<cols.length;j++){
						var ngay=line0[j];
						if(!isNaN(ngay)){
							var cong=cols[j];
							if(cong){
								json={madoitac:madoitac,manhanvien:cols[header.manhanvien],madiemban:(cols[header.madiemban]?cols[header.madiemban]:"0"),nam:numTinhCong_Year.value,thang:numTinhCong_Month.value,ngay:ngay,lan:0,dulieu:dulieu,chamcong:null,ngaycong:null};
								if(isNaN(cong)){
									if(cong=='0.5P'||cong=='P/2'){
										json.chamcong="P/2";
										json.ngaycong=0.5;
									} else json.chamcong=cong;
								} else json.ngaycong=cong;
								data.push(json);
							}
						}
						
					}
				}
				
				NUT_DS.upsert({url:_context.service["hrms"].urledit+"chamcong_v",data:data,keys:"madoitac,manhanvien,madiemban,nam,thang,ngay,lan,dulieu"},function(){
					NUT.tagMsg("Data imported.","lime",document.activeElement);
				});
			}
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow",document.activeElement);
	}
}