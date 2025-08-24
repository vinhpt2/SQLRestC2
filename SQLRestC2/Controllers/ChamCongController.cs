using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;
using System.Text.Json.Nodes;

namespace SQLRestC2.Controllers
{
    [ApiController]
    [Route(Global.ROOT + "chamcong/{database}/{schema}/{sid}/{did}/{jwt}")]
    public class ChamCongController : ControllerBase
    {
        [HttpPost]
        public async Task<ResponseJson> Post(String database, String schema, int sid, int did, String jwt)
        {
            Server server = null;
            try
            {
                server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                var db = server.Databases[database];
                var response = new ResponseJson { success = (db != null) };
                if (response.success)
                {
                    response.success = Global.jwtkey.Equals(jwt);
                    if (response.success)
                    {
                        var formData = await this.Request.ReadFormAsync();
                        var obj = JsonObject.Parse(formData["event_log"]);
                        var evtObj = obj["AccessControllerEvent"];
                        response.success = evtObj != null;
                        if (response.success)
                        {
                            response.success = evtObj["verifyNo"] != null;
                            if (response.success)
                            {
                                String sqlStr = "insert into " + database + "." + schema + ".n_chamcong(siteid,deviceid,staffno,staffname,checktime,verifyno)values(" + sid + "," + did + ",'" + evtObj["employeeNoString"] + "','" + evtObj["name"] + "','" + obj["dateTime"] + "'," + evtObj["verifyNo"] + ")";
                                response.success = Global.safeSqlInjection(sqlStr);
                                if (response.success) db.ExecuteNonQuery(sqlStr);
                                else response.result = "SQL INJECTION FOUND! Not safe to executes.";
                            }
                            else response.result = "'verifyNo' not found!";
                        }
                        else response.result = "'AccessControllerEvent' not found!";
                    }
                    else response.result = "Jwt key not match!";
                }
                else response.result = "Database '" + database + "' not found!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
    }
}
