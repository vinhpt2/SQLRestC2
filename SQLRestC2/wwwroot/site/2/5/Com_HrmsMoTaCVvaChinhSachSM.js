var Com_HrmsMoTaCVvaChinhSachSM={
	run:function(p){
		var pdf=_context.user.username.startsWith("HTSM")?"MoTaCVvaChinhSachHTSM.pdf":"MoTaCVvaChinhSachSM.pdf";
		window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/"+pdf);
	}
}