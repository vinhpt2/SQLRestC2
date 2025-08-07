var RptDoanhThuChiPhi={
	run:function(p){
		RptDoanhThuChiPhi.url = NUT.services[3].url;
		var now=(new Date()).toISOString().substring(0,10);
		NUT.w2popup.open({
			title: '📜 <i>Doanh thu chi phí</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date' value='"+now+"'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date' value='"+now+"'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					NUT.ds.post({url:RptDoanhThuChiPhi.url+"procedure/dtcp_sp/'"+datTuNgay.value+"','"+datDenNgay.value+"'"},function(res){
						if(res.success&&res.result.length){
							var win=window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/RptDoanhThuChiPhi.html");
							win.onload=function(){
								this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
								var sum=[0,0,0,0,0,0,0,0,0,0,0,0,0,0];
								for(var i=0;i<res.result.length;i++){
									var rec=res.result[i];
									var doanhthuthuan=rec.DOANH_THU-rec.GIAM_TRU_DT;
									var congchiphi=rec.CP_NGUYENVL+rec.NHAN_CONG+rec.MUA_NGOAI+rec.CP_CHUNG;
									var giavon=rec.HOA_HONG+congchiphi;
									var lailo=doanhthuthuan-rec.HOA_HONG-congchiphi-rec.CP_BAN_HANG-rec.CP_QUAN_LY-rec.CP_KHAC;
									var row=this.tblData.insertRow();
									row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'>"+rec.MA_DU_AN+"</td><td align='right'>"+rec.DOANH_THU.toLocaleString()+"</td><td align='right'>"+rec.GIAM_TRU_DT.toLocaleString()+"</td><td align='right'>"+doanhthuthuan.toLocaleString()+"</td><td align='right'>"+rec.HOA_HONG.toLocaleString()+"</td><td align='right'>"+rec.CP_NGUYENVL.toLocaleString()+"</td><td align='right'>"+rec.NHAN_CONG.toLocaleString()+"</td><td align='right'>"+rec.MUA_NGOAI.toLocaleString()+"</td><td align='right'>"+rec.CP_CHUNG.toLocaleString()+"</td><td align='right'>"+congchiphi.toLocaleString()+"</td><td align='right'>"+giavon.toLocaleString()+"</td><td align='right'>"+rec.CP_BAN_HANG.toLocaleString()+"</td><td align='right'>"+rec.CP_QUAN_LY.toLocaleString()+"</td><td align='right'>"+rec.CP_KHAC.toLocaleString()+"</td><td align='right'>"+lailo.toLocaleString()+"</td><td align='right'>"+(Math.round(1000*lailo/doanhthuthuan)/10).toLocaleString()+"%</td>";
									sum[0]+=rec.DOANH_THU;
									sum[1]+=rec.GIAM_TRU_DT;
									sum[2]+=doanhthuthuan;
									sum[3]+=rec.HOA_HONG;
									sum[4]+=rec.CP_NGUYENVL;
									sum[5]+=rec.NHAN_CONG;
									sum[6]+=rec.MUA_NGOAI;
									sum[7]+=rec.CP_CHUNG;
									sum[8]+=congchiphi;
									sum[9]+=giavon;
									sum[10]+=rec.CP_BAN_HANG;
									sum[11]+=rec.CP_QUAN_LY;
									sum[12]+=rec.CP_KHAC;
									sum[13]+=lailo;
								}
								var row=this.tblData.insertRow();
								row.innerHTML="<td colspan='2' align='center'><b>TỔNG</b></td>"
								for(var i=0;i<sum.length;i++){
									var cell=row.insertCell();
									cell.align='right';
									cell.innerHTML="<b>"+sum[i].toLocaleString()+"</b>";
								}
							}
						} else NUT.notify("⚠️ No data to report!","yellow");
					});
				}
			}
		})
	}
}