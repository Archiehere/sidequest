import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INSTAMART_CLIENT } from './instamart.client';
import { MockInstamartClient } from './mock-instamart.client';

@Module({
  providers: [
    {
      provide: INSTAMART_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mcpUrl = config.get<string>('INSTAMART_MCP_URL');
        const mcpToken = config.get<string>('INSTAMART_MCP_TOKEN');
        if (mcpUrl && mcpToken) {
          // TODO: real MCP client. Swiggy's MCP at mcp.swiggy.com/im needs
          // partner creds (401 even on initialize). Wire up once we have them.
          // For now we always fall through to the mock.
          console.warn('INSTAMART_MCP_URL set but real client not implemented yet — using mock.');
        }
        return new MockInstamartClient();
      },
    },
  ],
  exports: [INSTAMART_CLIENT],
})
export class InstamartModule {}
