using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddAssignedToUserIdToIncident : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "AssignedToUserId",
            table: "Incidents",
            type: "text",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Incidents_AssignedToUserId",
            table: "Incidents",
            column: "AssignedToUserId");

        migrationBuilder.AddForeignKey(
            name: "FK_Incidents_Users_AssignedToUserId",
            table: "Incidents",
            column: "AssignedToUserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Incidents_Users_AssignedToUserId",
            table: "Incidents");

        migrationBuilder.DropIndex(
            name: "IX_Incidents_AssignedToUserId",
            table: "Incidents");

        migrationBuilder.DropColumn(
            name: "AssignedToUserId",
            table: "Incidents");
    }
}

