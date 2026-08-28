import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CleanupService } from './cleanup.service';

@ApiTags('admin-cleanup')
@ApiBearerAuth()
@Controller('admin/cleanup')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('files')
  @ApiOperation({ summary: 'Clean up orphan files from bucket' })
  @ApiQuery({
    name: 'dryRun',
    required: false,
    type: Boolean,
    description: 'If true, only shows orphan files without deleting them',
  })
  async runCleanup(@Query('dryRun') dryRun: boolean = true) {
    const result = await this.cleanupService.runCleanup(dryRun);
    return {
      message: dryRun
        ? 'Dry run mode: orphan files identified (nothing deleted)'
        : 'Orphan file cleanup completed',
      data: {
        totalBucketFiles: result.totalBucketFiles,
        totalDBFiles: result.totalDBFiles,
        orphanFilesCount: result.orphanFiles.length,
        deletedCount: result.deletedCount,
        sampleOrphanFiles: result.orphanFiles.slice(0, 10),
      },
    };
  }

  @Post('files/now')
  @ApiOperation({ summary: 'Run cleanup immediately (same as Cron Job)' })
  async runNow() {
    const result = await this.cleanupService.runCleanup(false);
    return { message: 'Cleanup completed', data: result };
  }
}