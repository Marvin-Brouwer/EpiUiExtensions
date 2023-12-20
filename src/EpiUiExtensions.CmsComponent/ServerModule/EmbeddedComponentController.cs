using EPiServer.Web;

using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Web.Http;

namespace EpiUiExtensions.CmsComponent.ServerModule;

/// <summary>
/// API controller to fake EPiServer into thinking we've included the component in the shell folder
/// </summary>
[RoutePrefix("EPiServer/Shell/{version}/ClientResources/{moduleNameSpace}/{componentName}/")]
public abstract class EmbeddedComponentController : ApiController
{
    private readonly IMimeTypeResolver _mimeTypeResolver;
    private readonly Assembly _targetAssembly;

    /// <inheritdoc cref="EmbeddedComponentController"/>
    protected EmbeddedComponentController(IMimeTypeResolver mimeTypeResolver)
    {
        _mimeTypeResolver = mimeTypeResolver;
        // Gets the assembly of the implementing type
        _targetAssembly = GetType().Assembly;
    }

    /// <summary>
    /// Pretend to be component/*
    /// </summary>
    [HttpGet, Route("{*path}")]
    public virtual HttpResponseMessage Index(string version, string path)
    {
        // We use the version attribute to make it dynamic
        _ = version;

        var mimeType = _mimeTypeResolver.GetMimeMapping(path);

        // Don't dispose, that breaks the controller logic
        var fileStream = GetResourceFile(path);
        fileStream.Seek(0, SeekOrigin.Begin);

        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StreamContent(fileStream)
            {
                Headers =
                {
                    ContentType = new MediaTypeHeaderValue(mimeType ?? "application/octet-stream"),
                    ContentEncoding = { Encoding.UTF8.WebName }
                }
            }
        };
    }

    private Stream GetResourceFile(string fileName)
    {
        var createDbScriptAssemblyPath = _targetAssembly.GetManifestResourceNames().First(name => name.EndsWith(fileName));
        return _targetAssembly.GetManifestResourceStream(createDbScriptAssemblyPath)!;
    }
}