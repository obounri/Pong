import { ArgumentsHost, Catch, HttpException, NotFoundException, UnauthorizedException, NotAcceptableException, ForbiddenException} from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(WsException, HttpException, NotFoundException, UnauthorizedException, NotAcceptableException, ForbiddenException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException | NotFoundException | UnauthorizedException | NotAcceptableException | ForbiddenException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as WebSocket;
    // const data = host.switchToWs().getData();
    let error = exception instanceof WsException ? exception?.getError() : exception?.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };
    client.send(JSON.stringify({
      event: "error",
      ...details
    }));
  }
}