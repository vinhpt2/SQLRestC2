using Microsoft.AspNetCore.Mvc;

namespace SQLRestC2.Controllers
{
    [ApiController]
    [Route(Global.ROOT + "proxy")]
    public class ProxyController : ControllerBase
    {
        private static readonly HttpClient _httpClient = new HttpClient();
        [HttpGet]
        [HttpPost]
        [HttpPut]
        [HttpDelete]
        public async Task Invoke()
        {
            var context = this.HttpContext;
            var url = context.Request.QueryString.Value;
            if (url != null)
            {
                var targetUri = new Uri(Uri.UnescapeDataString(url.Remove(0, 1)));
                var requestMessage = new HttpRequestMessage();
                CopyFromOriginalRequestContentAndHeaders(context, requestMessage);
                requestMessage.RequestUri = targetUri;
                requestMessage.Headers.Host = targetUri.Host;
                var method = context.Request.Method;
                if (HttpMethods.IsGet(method)) requestMessage.Method = HttpMethod.Get;
                else if (HttpMethods.IsPost(method)) requestMessage.Method = HttpMethod.Post;
                else if (HttpMethods.IsDelete(method)) requestMessage.Method = HttpMethod.Delete;
                else if (HttpMethods.IsPut(method)) requestMessage.Method = HttpMethod.Put;
                else if (HttpMethods.IsHead(method)) requestMessage.Method = HttpMethod.Head;
                else if (HttpMethods.IsOptions(method)) requestMessage.Method = HttpMethod.Options;
                else if (HttpMethods.IsTrace(method)) requestMessage.Method = HttpMethod.Trace;

                using (var responseMessage = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted))
                {
                    context.Response.StatusCode = (int)responseMessage.StatusCode;
                    CopyFromTargetResponseHeaders(context, responseMessage);
                    await responseMessage.Content.CopyToAsync(context.Response.Body);
                }
            }
        }

        private void CopyFromOriginalRequestContentAndHeaders(HttpContext context, HttpRequestMessage requestMessage)
        {
            var requestMethod = context.Request.Method;

            if (!HttpMethods.IsGet(requestMethod) &&
                !HttpMethods.IsHead(requestMethod) &&
                !HttpMethods.IsDelete(requestMethod) &&
                !HttpMethods.IsTrace(requestMethod))
            {
                var streamContent = new StreamContent(context.Request.Body);
                requestMessage.Content = streamContent;
            }

            foreach (var header in context.Request.Headers)
            {
                requestMessage.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        private void CopyFromTargetResponseHeaders(HttpContext context, HttpResponseMessage responseMessage)
        {
            foreach (var header in responseMessage.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }

            foreach (var header in responseMessage.Content.Headers)
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
            context.Response.Headers.Remove("transfer-encoding");
        }
    }
}
