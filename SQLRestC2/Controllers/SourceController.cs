using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT + "source/{d1}/{d2}")]
    public class SourceController : ControllerBase
    {
        [HttpGet]
        public async Task<ResponseJson> GetList(int d1, int d2,String? d)
        {
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success =user.issystem && user.siteid == d1 && !( user.apps.ContainsKey(d2)) };

                if (response.success)
                {
                    var prefix = "site/" + d1 + "/" + d2 + "/";
                    if (d != null) prefix += d;
                    var path = "wwwroot/" + prefix;
                    var rs = new Dictionary<String, Object>();
                    if (d == null || d.EndsWith("/"))
                    {
                        rs.Add("dirs", Directory.GetDirectories(path));
                        rs.Add("files", Directory.GetFiles(path));
                        response.result = rs;
                    }
                    else
                    {
                        var info=new FileInfo(path);
                        response.total=info.Exists ? info.Length : -1;
                    }
                }
                else response.result = "User do not have assess right!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
        }
        [HttpPost]
        public async Task<ResponseJson> Upload(int d1, int d2, String? d,String? f)
        {
            try{
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem && user.siteid == d1 && !(user.apps.ContainsKey(d2)) };
                if (response.success)
                {
                    var prefix = "site/" + d1 + "/" + d2 + "/";
                    if (d != null) prefix += d;
                    var path = "wwwroot/" + prefix;
                    if (!Directory.Exists(path)) Directory.CreateDirectory(path);
                    if ("file".Equals(f)){
                        var formData = await Request.ReadFormAsync();
                        var names = new String[formData.Files.Count];
                        for (var i = 0; i < formData.Files.Count; i++)
                        {
                            var file = formData.Files[i];
                            using (var stream = new FileStream(path+file.Name, FileMode.OpenOrCreate))
                            {
                                file.CopyTo(stream);
                                stream.Flush();
                            }
                            names[i] = file.Name;
                        }
                        response.result = names;
                    }
                    else response.result = path;
                }
                else response.result = "User do not have assess right!";
                return response;
            } catch (Exception ex) {
                return new ResponseJson { success = false,result=ex.Message };
            }
        }
        [HttpDelete]
        public async Task<ResponseJson> Delete(int d1, int d2, String? d)
        {
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var response = new ResponseJson { success = user.issystem && user.siteid == d1 && !(user.apps.ContainsKey(d2)) };
                if (response.success)
                {
                    var prefix = "site/" + d1 + "/" + d2 + "/";
                    if (d != null) prefix += d;
                    var path = "wwwroot/" + prefix;
                    if (d.EndsWith("/")) {
                        response.success = Directory.Exists(path);
                        if(response.success) Directory.Delete(path);
                    } else {
                        response.success=System.IO.File.Exists(path);
                        if (response.success) System.IO.File.Delete(path);
                    }
                }
                else response.result = "User do not have assess right!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.Message };
            }
        }
    }
}
