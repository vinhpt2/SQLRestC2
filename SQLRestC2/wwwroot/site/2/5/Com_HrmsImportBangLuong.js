var Com_HrmsImportBangLuong={
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
		
		var id="divCom_HrmsImportBangLuong";
		var fieldnames=["manhanvien","makhuvuc","c10","c11","c12","c13","c14","c15","c16","c17","c18","c19","c20","c21","c22","c23","c24","c25","c26","c27","c28","c29","c30","c31","c32","c33","c34","c35","c36","c37","c38","c39","c40","c41","c42","c43","c44","c45","ghichu"];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Import Bảng lương từ Excel</i>",
			modal:true,
			width: 1000,
			height: 750,
			body: "<textarea cols="+(header.length+8*fieldnames.length)+" id='"+id+"' style='height:95%'>"+header+"</textarea><table style='margin:auto'><tr><td>Đối tác</td><td colspan='3'>"+cbo.outerHTML+"</td><td>Vị trí</td><td colspan='3'><select id='cboTinhCong_ViTriLV'"+(p=="SM"?"disabled>":"><option></option>")+"<option value='SM'>SM</option><option value='BA'>BA</option><option value='BA_PT'>BA_PartTime</option></select></td><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number'/></td><td><input id='chkTinhCong_Edit' type='checkbox' checked/></td><td><label for='chkTinhCong_Edit'>Ghi vào dữ liệu Hiệu chỉnh</label></td><td><b style='color:red'>(Dữ liệu CŨ sẽ bị ghi đè!)</b></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsImportBangLuong.insert('+id+'.value)">✔️ Import</button>'
		});
		
	},
	insert:function(csv){
		if(cboTinhCong_ViTriLV.value&&numTinhCong_Year.value&&numTinhCong_Month.value){
			var lines=csv.split("\n");
			if(lines.length<2){
				NUT.tagMsg("Empty data","yellow");
			}else{
				var dulieu=(chkTinhCong_Edit.checked?1:0);
				var madoitac=cboTinhCong_DoiTac.value;
				var vitrilv=cboTinhCong_ViTriLV.value;
				var nam=numTinhCong_Year.value;
				var thang=numTinhCong_Month.value;
				var line0=lines[0].split("\t");
				var data=[];
				for(var i=1;i<lines.length;i++){
					var line=lines[i];
					if(line){
						var cols=line.split("\t");
						var json={madoitac:madoitac,vitrilv:vitrilv,nam:nam,thang:thang,dulieu:dulieu};
						for(var j=0;j<line0.length;j++)json[line0[j]]=cols[j];
						data.push(json);
					}
				}
				NUT_DS.upsert({url:_context.service["hrms"].urledit+"bangluong",data:data,keys:"nam,thang,madoitac,manhanvien,vitrilv,dulieu"},function(res){
					NUT.tagMsg("Data imported.","lime",document.activeElement);
				});
			}
		} else NUT.tagMsg("Nhập Vị trí làm việc, năm, tháng trước khi thực hiện!","yellow",document.activeElement);
	}
}