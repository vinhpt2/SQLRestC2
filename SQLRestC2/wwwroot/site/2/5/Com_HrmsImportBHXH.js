var Com_HrmsImportBHXH={
	run:function(p){
		var id="divCom_HrmsImportBHXH";
		var fieldnames=["manhanvien","sobhxh",1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,10 ,11 ,12];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Import BHXH từ Excel</i>",
			modal:true,
			width: 1000,
			height: 750,
			body: "<textarea cols="+(header.length+8*fieldnames.length)+" id='"+id+"' style='height:95%'>"+header+"</textarea><table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number'/></td><td><b style='color:red'>(Dữ liệu CŨ sẽ bị ghi đè!)</b></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsImportBHXH.insert('+id+'.value)">✔️ Import</button>'
		});
	},
	insert:function(csv){
		if(numTinhCong_Year.value){
			var lines=csv.split("\n");
			if(lines.length<2){
				NUT.tagMsg("Empty data","yellow");
			}else{
				var line0=lines[0].split("\t");
				var header={};
				for(var i=0;i<line0.length;i++)
					header[line0[i]]=i;
				var data=[];
				for(var i=1;i<lines.length;i++){
					var cols=lines[i].split("\t");
					var json=null;
					for(var j=0;j<cols.length;j++){
						var thang=line0[j];
						if(!isNaN(thang)){
							var st=cols[j];
							if(st){
								json={manhanvien:cols[header.manhanvien],sobhxh:cols[header.sobhxh],nam:numTinhCong_Year.value,thang:thang,khongdong:null,sotien:null};
								if(isNaN(st))json.khongdong=st;
								else json.sotien=st;
								data.push(json);
							}
						}
					}
				}
				
				NUT_DS.upsert({url:_context.service["hrms"].urledit+"baohiemxahoi",data:data,keys:"manhanvien,nam,thang"},function(){
					NUT.tagMsg("Data imported.","lime",document.activeElement);
				});
			}
		} else NUT.tagMsg("Nhập năm trước khi thực hiện!","yellow",document.activeElement);
	}
}