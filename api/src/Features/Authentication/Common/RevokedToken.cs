namespace api.Features.Authentication.Common;

public class RevokedToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiryTime { get; set; }
}
