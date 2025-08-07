var Com_HrmsLoaiBoUngVien={
	run:function(p){
		if(p.records.length){
			var nv=p.records[0];
			var conf=p.config;
			var grid=p.grid;
			
			var now=new Date();
			var nam=now.getFullYear();
			var thang=now.getMonth()+1;
			var ngay=now.getDate();
			
			w2prompt({label:'Ngày loại bỏ',title:'Loại bỏ ứng viên - '+nv.hoten,value:nam+"-"+thang+"-"+ngay}).ok(function(value){
				if(value){
					NUT_DS.update({url:conf.urledit,data:{loaibo:true,ngayloaibo:value},where:[conf.columnkey,"=",nv[conf.columnkey]]},function(res){
						grid.remove(grid.getSelection()[0]);
						NUT.tagMsg("Record remove.","lime");
					});
				}
			});
		}else NUT.tagMsg("Không có Dữ liệu nào được chọn!","yellow");
	}
}