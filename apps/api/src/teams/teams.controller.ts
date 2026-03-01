import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { TeamRole } from "@prisma/client";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";

import { CreateTeamDto } from "./dto/create-team.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { JoinTeamDto } from "./dto/join-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamGuard } from "./guards/team.guard";
import { TeamsService } from "./teams.service";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getMyTeams(@CurrentUser() user: AuthUser) {
    return this.teamsService.getMyTeams(user.sub);
  }

  @Post()
  createTeam(@Body() dto: CreateTeamDto, @CurrentUser() user: AuthUser) {
    return this.teamsService.createTeam(dto, user);
  }

  @UseGuards(TeamGuard)
  @Get(":id")
  getTeam(@Param("id") id: string) {
    return this.teamsService.getTeam(id);
  }

  @UseGuards(TeamGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Patch(":id")
  updateTeam(@Param("id") id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, dto);
  }

  @UseGuards(TeamGuard)
  @Roles(TeamRole.OWNER)
  @Delete(":id")
  deleteTeam(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.teamsService.deleteTeam(id, user);
  }

  @UseGuards(TeamGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Post(":id/invite")
  inviteMember(@Param("id") id: string, @Body() dto: InviteMemberDto, @CurrentUser() user: AuthUser) {
    return this.teamsService.inviteMember(id, dto, user);
  }

  @Post(":id/join")
  joinTeam(@Param("id") id: string, @Body() dto: JoinTeamDto, @CurrentUser() user: AuthUser) {
    return this.teamsService.joinTeam(id, dto.token, user);
  }

  @UseGuards(TeamGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Delete(":id/members/:userId")
  removeMember(@Param("id") id: string, @Param("userId") userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
