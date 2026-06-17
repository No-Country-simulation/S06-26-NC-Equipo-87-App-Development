using FluentValidation;

using Microsoft.AspNetCore.Mvc;

namespace api.Features.Authentication.Login;

[ApiController]
[Route("api/authentication")]
public class LoginEndpoint(LoginHandler handler, IValidator<LoginCommand> validator) : ControllerBase
{
    private readonly LoginHandler _handler = handler;
    private readonly IValidator<LoginCommand> _validator = validator;

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LoginResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var result = await _handler.HandleAsync(command);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("Identifier", result.ErrorMessage ?? "Invalid credentials.");
            return ValidationProblem(ModelState);
        }

        return Ok(new LoginResponse { Token = result.Token ?? string.Empty });
    }
}
