using System.Security.Claims;

using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Authentication.UpdatePushToken;

[ApiController]
[Route("api/users")]
[Tags("Authentication")]
public class UpdatePushTokenEndpoint(UpdatePushTokenHandler handler, IValidator<UpdatePushTokenCommand> validator) : ControllerBase
{
    private readonly UpdatePushTokenHandler _handler = handler;
    private readonly IValidator<UpdatePushTokenCommand> _validator = validator;

    [HttpPut("push-token")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdatePushToken([FromBody] UpdatePushTokenCommand command)
    {
        FluentValidation.Results.ValidationResult validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (FluentValidation.Results.ValidationFailure error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        UpdatePushTokenResult result = await _handler.HandleAsync(userId, command);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("ExpoPushToken", result.ErrorMessage ?? "Failed to update push token.");
            return ValidationProblem(ModelState);
        }

        return Ok(new { message = "Push token updated successfully." });
    }
}
