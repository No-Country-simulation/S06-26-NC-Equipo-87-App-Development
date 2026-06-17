namespace api.Features.Authentication.Login;

public class LoginCommand
{
    public string Identifier { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
