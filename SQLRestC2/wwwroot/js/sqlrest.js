export class SqlREST {
	static token = null;
	static OPERATOR = {
		"is": " is ",
		"!is": " is not ",
		"like": " like ",
		"!like": " not like ",
		"in": " in(",
		"!in": " not in(",
		"=": "=",
		"<>": "<>",
		">": ">",
		">=": ">=",
		"<": "<",
		"<=": "<=",
		"between": " between "
	}
	static decodeSql(p, notReturnLogic) {
		var decode = "";
		if (p.where && p.where.length) {
			var i0 = (p.where[0] == "and" || p.where[0] == "or" ? 1 : 0);
			var logic = i0 ? p.where[0] : "and";
			//if(notReturnLogic!=0)logic+="=";
			var needOpen = (p.where.length > i0 + 1 || notReturnLogic != 0);
			if (Array.isArray(p.where[i0])) {//array-array
				if (needOpen) decode += "(";
				for (var i = i0; i < p.where.length; i++) {
					var where = p.where[i];
					var j0 = (where[0] == "and" || where[0] == "or" ? 1 : 0);
					if (i > i0) decode += " " + logic + " ";
					if (Array.isArray(where[j0])) {//array-array
						decode += SqlREST.decodeSql({ where: where }, 0);
					} else {//array
						var op = where[j0 + 1];
						var val = where[j0 + 2];
						if (typeof val == "string" && val.startsWith("n$.")) val = eval(val);
						if (typeof val == "string" && op != "between") val = "N'" + val + "'";
						if (typeof val == "boolean") val = val ? 1 : 0;
						var clause = where[j0] + SqlREST.OPERATOR[op] + val;
						if (op == "in" || op == "!in") clause += ")";
						decode += clause;
					}
				}
				if (needOpen) decode += ")";
			} else {//array
				var op = p.where[i0 + 1];
				var val = p.where[i0 + 2];
				if (typeof val == "string" && val.startsWith("n$.")) val = eval(val);
				if (typeof val == "string" && op != "between") val = "N'" + val + "'";
				if (typeof val == "boolean") val = val ? 1 : 0;
				decode += p.where[i0] + SqlREST.OPERATOR[op] + val;
				if (op == "in" || op == "!in") decode += ")";
				if (notReturnLogic) decode = "(" + decode + ")";
			}
		}

		if (p.select) decode += "&select=" + p.select;
		if (p.orderby) decode += "&orderby=" + p.orderby;
		if (p.groupby) decode += "&groupby=" + p.groupby;
		if (p.having) decode += "&having=" + p.having;
		if (p.offset) decode += "&offset=" + p.offset;
		if (p.limit) decode += "&limit=" + p.limit;
		return decode;
	}

	static select(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.response);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("GET", p.url + (p.id ? "/" + p.id : "?where=" + this.decodeSql(p)), true);
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		xhr.send(); 7
	}
	static insert(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.response);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("POST", p.returnid ? p.url + "?returnid=true" : p.url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		xhr.send(JSON.stringify(Array.isArray(p.data) ? p.data : [p.data]));
	}
	static update(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.response);
			}
		};

		if (p.where) p.url += "?where=" + this.decodeSql(p);
		else if (p.key) p.url += "?key=" + p.key;
		xhr.onerror = this.onerror;
		xhr.open("PUT", p.url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		xhr.send(JSON.stringify(Array.isArray(p.data) ? p.data : [p.data]));
	}
	static delete(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.response);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("DELETE", p.url + "?where=" + this.decodeSql(p), true);
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		xhr.send();
	}
	static get(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open(p.method || "GET", p.url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		p.data ? xhr.send(JSON.stringify(p.data)) : xhr.send();
	}
	static post(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open(p.method || "POST", p.url, true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		if (this.token) xhr.setRequestHeader("Authorization", this.token);
		xhr.send(JSON.stringify(p.data));
	}
	static getText(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(this.response);
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("GET", p.url, true);
		xhr.setRequestHeader("Content-Type", "text/html;charset=UTF-8");
		xhr.send();
	}
	static onerror(err) {
		alert("🛑 ERROR: " + err);
	}
}