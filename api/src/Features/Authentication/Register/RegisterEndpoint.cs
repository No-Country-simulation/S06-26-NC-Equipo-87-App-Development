using FluentValidation;

using Microsoft.AspNetCore.Mvc;

namespace api.Features.Authentication.Register;

[ApiController]
[Route("api/authentication")]
[Tags("Authentication")]
public class RegisterEndpoint(RegisterHandler handler, IValidator<RegisterCommand> validator) : ControllerBase
{
    private readonly RegisterHandler _handler = handler;
    private readonly IValidator<RegisterCommand> _validator = validator;

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(RegisterResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
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
            if (!string.IsNullOrEmpty(result.InvalidRoleError))
            {
                ModelState.AddModelError("Role", result.InvalidRoleError);
                return ValidationProblem(ModelState);
            }

            foreach (var error in result.Errors)
            {
                string key = string.Empty;
                if (error.Code.Contains("Password"))
                {
                    key = "Password";
                }
                else if (error.Code.Contains("Email"))
                {
                    key = "Email";
                }
                else if (error.Code.Contains("UserName") || error.Code.Contains("User"))
                {
                    key = "Username";
                }

                ModelState.AddModelError(key, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        return Created(string.Empty, new RegisterResponse
        {
            UserId = result.UserId ?? string.Empty,
            Username = result.Username ?? string.Empty,
            Email = result.Email ?? string.Empty,
            Role = result.Role ?? string.Empty,
            FirstName = result.FirstName ?? string.Empty,
            LastName = result.LastName ?? string.Empty,
            EmployeeId = result.EmployeeId ?? string.Empty,
            Pin = result.Pin ?? string.Empty,
            AreaId = result.AreaId,
            ShiftId = result.ShiftId
        });
    }
}
