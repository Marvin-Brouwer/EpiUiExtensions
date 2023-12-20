using System;

using EPiServer.Core;
using EPiServer.Framework.Serialization;
using EPiServer.Logging;
using EPiServer.ServiceLocation;

namespace EpiUiExtensions.CmsComponent.PropertyBase;

/// <summary>
/// Property base class to store any kind of data into an EpiServer property using JSON
/// </summary>
public abstract class PropertyJsonBase<TModel> : PropertyLongString
    where TModel : class, new()
{
    private readonly IObjectSerializer _objectSerializer;
    private readonly ILogger _logger;

    /// <inheritdoc />
    protected PropertyJsonBase()
    {
        _objectSerializer = ServiceLocator.Current.GetInstance<IObjectSerializerFactory>()
            .GetSerializer("application/json");
        _logger = LogManager.GetLogger(GetType());
    }

    public override Type PropertyValueType => typeof(TModel);
    public override object SaveData(PropertyDataCollection properties) => LongString;
    public override object? Value { get => GetValue(); set => SetValue(value); }
    public TModel? ModelValue { get => GetValue(); set => SetValue(value); }

    private void SetValue(object? value)
    {
        if (value is null) LongString = null;
        if (value is string stringValue) LongString = stringValue;
        if (value is not TModel) return;

        try
        {
            LongString = _objectSerializer.Serialize(value);
        }
        catch (Exception ex)
        {
            _logger.Error($"Failed to serialize {typeof(TModel)}", ex);
        }
    }

    private TModel? GetValue()
    {
        if (string.IsNullOrEmpty(LongString)) return default;

        try
        {
            return _objectSerializer.Deserialize<TModel>(LongString);
        }
        catch (Exception ex)
        {
            _logger.Error($"Failed to deserialize {typeof(TModel)}", ex);
            return default;
        }
    }
}