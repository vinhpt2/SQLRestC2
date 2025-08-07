var Com_HrmsImportSanLuong={
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
		
		var id="divCom_HrmsImportSanLuong";
		var fieldnames=["manhanvien","madiemban","1-spA" ,"1-spB" ,"1-spC..." ,"2-spA" ,"2-spB" ,"2-spC..." ,"3-spA" ,"3-spB" ,"3-spC..." ,];
		var header=fieldnames.join('\t')+"\n";
		var now=new Date();
		w2popup.open({
			title:"📥 <i>Import Sản lượng từ Excel</i>",
			modal:true,
			width: 1000,
			height: 750,
			body: "<textarea cols='"+(header.length+8*fieldnames.length)+"' id='"+id+"' style='height:95%'>"+header+"</textarea><table style='margin:auto'><tr><td></td><td></td><td>Đối tác</td><td colspan='3'>"+cbo.outerHTML+"</td><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number'/></td><td><input id='chkTinhCong_Edit' type='checkbox' checked/></td><td><label for='chkTinhCong_Edit'>Ghi vào dữ liệu Hiệu chỉnh</label></td><td><b style='color:red'>(Dữ liệu CŨ sẽ bị ghi đè!)</b></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsImportSanLuong.insert('+id+'.value)">✔️ Import</button>'
		});
	},
	insert:function(csv){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var lines=csv.split("\n");
			if(lines.length<2){
				NUT.tagMsg("Empty data","yellow");
			}else{
				var madoitac=cboTinhCong_DoiTac.value;
				var dulieu=(chkTinhCong_Edit.checked?1:0);
				var line0=lines[0].split("\t");
				var header={};
				for(var i=0;i<line0.length;i++)
					header[line0[i]]=i;
				var data=[];
				for(var i=1;i<lines.length;i++){
					var cols=lines[i].split("\t");
					var oldNgay=null;
					var json=null;
					for(var j=0;j<cols.length;j++){
						if(line0[j].includes("-")){
							var tokens=line0[j].split("-");
							var ngay=tokens[0], sp=tokens[1];
							if(ngay!=oldNgay){
								if(oldNgay!=null)data.push(json);
								oldNgay=ngay;
								json={madoitac:madoitac,manhanvien:cols[header.manhanvien],madiemban:cols[header.madiemban],nam:numTinhCong_Year.value,thang:numTinhCong_Month.value,ngay:ngay,lan:0,dulieu:dulieu};
							}
							json[sp]=(cols[j]?cols[j]:null);
						}
					}
					if(oldNgay!=null)data.push(json);
				}
				NUT_DS.upsert({url:_context.service["hrms"].urledit+"chamcong_v",data:data,keys:"madoitac,manhanvien,madiemban,nam,thang,ngay,lan,dulieu"},function(){
					NUT.tagMsg("Data imported.","lime",document.activeElement);
				});
			}
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow",document.activeElement);
	}
}