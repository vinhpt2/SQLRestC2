var Com_HrmsInThongTinNV={
	run:function(p){
		if(p.records.length){
			var nv=p.records[0];
			var win = window.open();
			var str='<table cellspacing="0" cellpadding="0" border="1"><caption><b>THÔNG TIN NHÂN VIÊN</b></caption>'+
				'<tr><td>Mã nhân viên</td><td colspan="3">'+nv["manhanvien"]+'</td><td colspan="3" rowspan="5"></td></tr>'+
				'<tr><td>Đánh giá</td><td colspan="3">'+nv["ghichu"]+'</td></tr>'+
				'<tr><td>Chi nhánh</td><td colspan="3">'+nv["makhuvuc"]+'</td></tr>'+
				'<tr><td>Thị trường</td><td colspan="3"></td></tr>'+
				'<tr><td>Họ và tên</td><td colspan="3">'+nv["hoten"]+'</td></tr>'+
				'<tr><td>Ngày sinh</td><td>'+nv["ngaysinh"]+'</td><td>Chiều cao</td><td>'+nv["chieucao"]+'</td><td>Cân nặng</td><td>'+nv["cannang"]+'</td></tr>'+
				'<tr><td>Số CMND</td><td>'+nv["socmt"]+'</td><td>Ngày cấp</td><td>'+nv["ngaycapcmt"]+'</td><td>Nơi cấp</td><td>'+nv["noicapcmt"]+'</td></tr>'+
				'<tr><td>Số điện thoại</td><td>'+nv["dienthoai"]+'</td><td>Email</td><td>'+nv["email"]+'</td><td></td><td></td></tr>'+
				'<tr><td>Số tài khoản</td><td>'+nv["sotaikhoan"]+'</td><td>Tên ngân hàng</td><td>'+nv["nganhang"]+'</td><td>Chi nhánh</td><td>'+nv["chinhanhnh"]+'</td></tr>'+
				'<tr><td>Địa chỉ TT</td><td colspan="6">'+nv["diachitt"]+'</td></tr>'+
				'<tr><td>Nơi ở hiện tại</td><td colspan="6">'+nv["noio"]+'</td></tr>'+
				'<tr><td>Ngày bắt đầu</td><td>'+nv["ngaybatdaulv"]+'</td><td>Ngày thôi việc</td><td>'+nv["ngaynghilv"]+'</td><td></td><td></td></tr></table>';
			win.document.write("<center>"+str+"</center>");
			win.document.title=nv["manhanvien"];
		}else NUT.tagMsg("Không có Dữ liệu nào được chọn!","yellow");
	}
}