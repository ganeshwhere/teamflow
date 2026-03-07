import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { TeamRole, type Team } from "@prisma/client";
import type {
  DeleteResult,
  InviteResult,
  JoinResult,
  RemoveResult,
  TeamDetail,
  TeamListItem,
} from "@repo/types";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { THROTTLE_PRESETS } from "../security/throttling.config";

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
  getMyTeams(@CurrentUser() user: AuthUser): Promise<TeamListItem[]> {
    return this.teamsService.getMyTeams(user.sub);
  }

  @Post()
  createTeam(@Body() dto: CreateTeamDto, @CurrentUser() user: AuthUser): Promise<Team> {
    return this.teamsService.createTeam(dto, user);
  }

  @UseGuards(TeamGuard)
  @Get(":id")
  getTeam(@Param("id") id: string): Promise<TeamDetail> {
    return this.teamsService.getTeam(id);
  }

  @UseGuards(TeamGuard, RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Patch(":id")
  updateTeam(@Param("id") id: string, @Body() dto: UpdateTeamDto): Promise<Team> {
    return this.teamsService.updateTeam(id, dto);
  }

  @UseGuards(TeamGuard, RolesGuard)
  @Roles(TeamRole.OWNER)
  @Delete(":id")
  deleteTeam(@Param("id") id: string, @CurrentUser() user: AuthUser): Promise<DeleteResult> {
    return this.teamsService.deleteTeam(id, user);
  }

  @UseGuards(TeamGuard, RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Throttle(THROTTLE_PRESETS.TEAM_INVITE)
  @Post(":id/invite")
  inviteMember(
    @Param("id") id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: AuthUser,
  ): Promise<InviteResult> {
    return this.teamsService.inviteMember(id, dto, user);
  }

  @Throttle(THROTTLE_PRESETS.TEAM_JOIN)
  @Post(":id/join")
  joinTeam(
    @Param("id") id: string,
    @Body() dto: JoinTeamDto,
    @CurrentUser() user: AuthUser,
  ): Promise<JoinResult> {
    return this.teamsService.joinTeam(id, dto.token, user);
  }

  @UseGuards(TeamGuard, RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  @Delete(":id/members/:userId")
  removeMember(@Param("id") id: string, @Param("userId") userId: string): Promise<RemoveResult> {
    return this.teamsService.removeMember(id, userId);
  }
}
