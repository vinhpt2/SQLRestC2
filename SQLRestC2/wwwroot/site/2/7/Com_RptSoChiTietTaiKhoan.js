var Com_RptSoChiTietTaiKhoan={
	run:function(p){
		var items=_context.domain[33].items;
		var cboTK=document.createElement("select");
		cboTK.id="cboTaiKhoan";
		cboTK.style.width="100%";
		cboTK.add(document.createElement("option"));
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cboTK.add(opt);
		}
		
		items=_context.domain[32].items;
		var cboDoiTac=document.createElement("select");
		cboDoiTac.id="cboDoiTac";
		cboDoiTac.style.width="100%";
		cboDoiTac.add(document.createElement("option"));
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cboDoiTac.add(opt);
		}
		NUT_DS.select({url:_context.service["fin"].urledit+"duan",limit:20000,order:"maduan",where:["madoitac","=","ORIT"]},function(duan){
			items=_context.domain[31].items;
			var cboDuAn=document.createElement("select");
			cboDuAn.id="cboDuAn";
			cboDuAn.style.width="100%";
			cboDuAn.add(document.createElement("option"));
			for(var i=duan.length-1;i>=0;i--){
				var da=duan[i];
				var opt=document.createElement("option");
				opt.value=da.madoitac;
				opt.innerHTML=da.tenduan;
				cboDuAn.add(opt);
			}		
			NUT_DS.select({url:_context.service["hrms"].urledit+"nhanvien_v",where:["madoitac","=","ORIT"]},function(res){
				var cboNhanVien=document.createElement("select");
				cboNhanVien.id="cboNhanVien";
				cboNhanVien.style.width="100%";
				cboNhanVien.style.display="none";
				cboNhanVien.add(document.createElement("option"));
				for(var i=0;i<res.length;i++){
					var opt=document.createElement("option");
					opt.value=res[i].manhanvien;
					opt.innerHTML=res[i].hoten;
					cboNhanVien.add(opt);
				}
				
				var str=cboTK.outerHTML;
				cboTK.id="cboTKDoiUng";
				var str2=cboTK.outerHTML;
				
				w2popup.open({
					title: '📜 <i>Sổ chi tiết tài khoản</i>',
					modal:true,
					width: 360,
					height: 300,
					body: "<table style='margin:auto'><caption><b><input id='chkTheoNhanVien' type='checkbox' onchange='cboDoiTac.style.display=(this.checked?\"none\":\"\");cboNhanVien.style.display=(this.checked?\"\":\"none\")'/><label for='chkTheoNhanVien'>Theo nhân viên</label></b></caption><tr><td>Tài khoản</td><td colspan='3'>"+str+"</td></tr><tr><td>TK đối ứng</td><td colspan='3'>"+str2+"</td></tr><tr><td>Đối tác</td><td>"+cboDoiTac.outerHTML+cboNhanVien.outerHTML+"</td><td>Dự án</td><td>"+cboDuAn.outerHTML+"</td></tr><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
					buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_RptSoChiTietTaiKhoan.runReport()">✔️ Report</button>'
				})
			})
		})
	},
	runReport:function(){
		var data={
			ngay:(datTuNgay.value?datTuNgay.value:null),
            tai_khoan:(cboTaiKhoan.value ? cboTaiKhoan.value:null),
			tk_doi_ung:(cboTKDoiUng.value?cboTKDoiUng.value:null),
			doi_tac:(!chkTheoNhanVien.checked&&cboDoiTac.value?cboDoiTac.value:null),
			nhan_vien:(chkTheoNhanVien.checked&&cboNhanVien.value?cboNhanVien.value:null),
			du_an:(cboDuAn.value?cboDuAn.value:null)
		};
		NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_tontk",data:data},function(tonTk){
			if(!tonTk)tonTk=0;
            var where = [];
            if(cboTaiKhoan.value)where.push(["taikhoan", "like", cboTaiKhoan.value+"*"]);
			if(datTuNgay.value)where.push(["ngaythanhtoan",">=",datTuNgay.value]);
			if(datDenNgay.value)where.push(["ngaythanhtoan","<=",datDenNgay.value]);
				
			if(cboTKDoiUng.value)where.push(["tkdoiung","like",cboTKDoiUng.value+"*"]);
			if(!chkTheoNhanVien.checked&&cboDoiTac.value)where.push(["madoitac","=",cboDoiTac.value]);
			if(chkTheoNhanVien.checked&&cboNhanVien.value)where.push(["manhanvien","=",cboNhanVien.value]);
			if(cboDuAn.value)where.push(["maduan","=",cboDuAn.value]);
				
			NUT_DS.select({url:_context.service["fin"].urledit+"thanhtoan",order:"idthanhtoan",where:where},function(res){
				if(res.length){
					var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptSoChiTietTaiKhoan.html");
					win.onload=function(){
						this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
						this.labTaiKhoan.innerHTML=cboTaiKhoan.value;
						this.labTKDoiUng.innerHTML=cboTKDoiUng.value;
						this.labDoiTac.innerHTML=cboDoiTac.value;
						this.labNhanVien.innerHTML=cboNhanVien.value;
						this.labDuAn.innerHTML=cboDuAn.value;
						this.labTonTk.innerHTML=tonTk.toLocaleString();
						var tongThu=0,tongChi=0;
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							tonTk+=(rec.lachi?-rec.giatri:rec.giatri);
							if(rec.lachi)tongChi+=rec.giatri;
							else tongThu+=rec.giatri;
							var row=this.tblData.insertRow();
							row.innerHTML="<td>"+(i+1)+"</td><td>"+rec.ngaythanhtoan+"</td><td>"+rec.sochungtu+"</td><td>"+rec.noidung+"</td><td>"+(rec.macongty?rec.macongty:"")+"</td><td>"+(rec.maduan?rec.maduan:"")+"</td><td align='right'>"+(rec.lachi?"":rec.giatri.toLocaleString())+"</td><td align='right'>"+(rec.lachi?rec.giatri.toLocaleString():"")+"</td><td align='right'>"+tonTk.toLocaleString()+"</td>";
						}
						var row=this.tblData.insertRow();
						row.innerHTML="<th colspan='6'>TỔNG</th><th align='right'>"+tongThu.toLocaleString()+"</th><th align='right'>"+tongChi.toLocaleString()+"</th><th align='right'>"+tonTk.toLocaleString()+"</th>";
					}
				} else NUT.tagMsg("No data to report!","yellow");
			});
		});
	}
}