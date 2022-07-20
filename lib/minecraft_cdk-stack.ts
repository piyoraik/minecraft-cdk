import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
  Token,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { MachineImage } from "aws-cdk-lib/aws-ec2";

export class MinecraftCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC作成
    const vpc = new ec2.Vpc(this, "MinecraftVpc", {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // キーペア作成
    const cfnKeyPair = new ec2.CfnKeyPair(this, "CfnKeyPair", {
      keyName: "test-key-pair",
    });
    cfnKeyPair.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // キーペア取得コマンドアウトプット
    new CfnOutput(this, "GetSSHKeyCommand", {
      value: `aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.getAtt(
        "KeyPairId"
      )} --region ${
        this.region
      } --with-decryption --query Parameter.Value --output text`,
    });

    // EC2作成
    const instance = new ec2.Instance(this, "MinecraftServer", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.SMALL
      ),
      machineImage: MachineImage.genericLinux({
        "ap-northeast-1": "ami-0f808c98d829a4f79",
      }),
      keyName: Token.asString(cfnKeyPair.ref),
    });
    instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    instance.connections.allowFromAnyIpv4(ec2.Port.tcp(25565));
  }
}
