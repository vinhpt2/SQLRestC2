var Com_HrmsThongTinUngVien={
	run:function(p){
		var items=_context.domain[14].items;
		var cbo=document.createElement("select");
		cbo.id="cboOpen_ViTri";
		cbo.style.width="100%";
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		
		w2popup.open({
			title: '🧡 <i>Thông tin khai báo</i>',
			modal:true,
			width: 330,
			height: 330,
			body: '<i style="color:brown">Bạn vui lòng cung cấp các thông tin để phục vụ công tác phỏng vấn tới đây của công ty MTV HABECO. Rất mong được cùng đồng hành với bạn trong thời gian tới! Trân trọng cảm ơn!</i><table style="margin:6px"><tr><td>Họ Tên*</td><td><input id="txtOpen_Ten" maxlength="100"/></td></tr><tr><td>Số điện thoại*</td><td><input id="txtOpen_SoDienThoai" maxlength="10"/></td></tr><tr><td>Vị trí ứng tuyển*</td><td>'+cbo.outerHTML+'</td></tr></table><br/><i style="color:blue"><b>Khai mới: </b>Nhập Họ tên đầy đủ, số điện thoại và vị trí ứng tuyển<br/><b>Khai bổ sung: </b>Nhập tên, số điện thoại, vị trí ứng tuyển đã khai lần trước</i>',
			buttons: '<button class="w2ui-btn" onclick="Com_HrmsThongTinUngVien.butNot_onClick()">📄 Khai mới</button><button class="w2ui-btn" onclick="Com_HrmsThongTinUngVien.butOk_onClick()">✔️ Khai bổ sung</button>'
		});
	},
	butOk_onClick(){
		if(txtOpen_Ten.value&&txtOpen_SoDienThoai.value&&cboOpen_ViTri.value){
			var where=[["hoten","like","*"+txtOpen_Ten.value],["dienthoai","=",txtOpen_SoDienThoai.value],["vitrilv","=",cboOpen_ViTri.value]];
			NUT_DS.select({url:_context.service["hrms"].urledit+"ungvien_v",where:where},function(res){
				if(res.length){
					w2popup.close();
					menu_onClick({item:{tag:{id:60,where:JSON.stringify(where)}}});
				}else NUT.tagMsg("Không tìm thấy dữ liệu!<br/>Xin Khai mới dữ liệu","yellow",document.activeElement);
			});
		} else NUT.tagMsg("Nhập Tên, Số điện thoại, Vị trí trước khi thực hiện!","yellow",document.activeElement);
	},
	butNot_onClick(){
		if(txtOpen_Ten.value&&txtOpen_SoDienThoai.value&&cboOpen_ViTri.value){
			if(txtOpen_Ten.value.includes(" ")){
				var data={hoten:txtOpen_Ten.value,dienthoai:txtOpen_SoDienThoai.value,vitrilv:cboOpen_ViTri.value,madoitac:"HABECO",ttungtuyen:"UngTuyen",ngaythuthap:new Date()};
				NUT_DS.insert({url:_context.service["hrms"].urledit+"ungvien_v",data:data},function(res){
					if(res.length){
						w2popup.close();
						var where=["idnhansu","=",res[0].idnhansu];
						menu_onClick({item:{tag:{id:60,where:JSON.stringify(where)}}});
					}else NUT.tagMsg("Không thêm mới được dữ liệu!","red",document.activeElement);
				});
				
			} else NUT.tagMsg("Nhập Tên đầy đủ Họ và tên trước khi thực hiện!","yellow",document.activeElement);
		} else NUT.tagMsg("Nhập Tên, Số điện thoại, Vị trí trước khi thực hiện!","yellow",document.activeElement);
	}
}