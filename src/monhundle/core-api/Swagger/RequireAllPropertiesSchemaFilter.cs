using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace core_api.Swagger;

/// <summary>
/// Marks the properties of an object schema as required. System.Text.Json writes every property
/// (null ones included), so they are always present in the payload; whether a property may hold
/// <c>null</c> is described separately by its <c>nullable</c> flag. Properties that can be left out
/// of the payload stay optional.
/// </summary>
public class RequireAllPropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema is not OpenApiSchema { Properties.Count: > 0 } objectSchema)
        {
            return;
        }
        
        // get all "forgettable" props in schema
        var omittablePropertyNames = context.Type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property =>
                property.GetCustomAttribute<JsonIgnoreAttribute>() is { } ignore
                && ignore.Condition != JsonIgnoreCondition.Never)
            .Select(property =>
                property.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name
                ?? JsonNamingPolicy.CamelCase.ConvertName(property.Name))
            .ToHashSet();
        
        foreach (var propertyName in objectSchema.Properties.Keys)
        {
            if (!omittablePropertyNames.Contains(propertyName))
            {
                objectSchema.Required ??= new HashSet<string>();
                objectSchema.Required.Add(propertyName);
            }
        }
    }
}
