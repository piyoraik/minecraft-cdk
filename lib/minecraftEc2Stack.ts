import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
  Token,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnEIP, MachineImage } from "aws-cdk-lib/aws-ec2";

export class MinecraftEC2Stack extends Stack {
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

    // IAMロール作成
    const s3Role = new iam.Role(this, "ec2-s3-role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      description: "S3-FullAccess",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    // キーペア取得コマンドアウトプット
    new CfnOutput(this, "GetSSHKeyCommand", {
      value: `aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.getAtt(
        "KeyPairId"
      )} --region ${
        this.region
      } --with-decryption --query Parameter.Value --output text`,
    });

    // EC2作成
    const minecraftInstance = new ec2.Instance(this, "MinecraftServer", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.LARGE
      ),
      machineImage: MachineImage.genericLinux({
        "ap-northeast-1": "ami-0f808c98d829a4f79",
      }),
      keyName: Token.asString(cfnKeyPair.ref),
      role: s3Role,
    });
    minecraftInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    minecraftInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(25565));

    // EIP作成 / 紐付け
    const eip = new CfnEIP(this, "minecraft_ec2_eip", {
      domain: "vpc",
    });

    new ec2.CfnEIPAssociation(this, "minecraft_ec2_eip_association", {
      eip: eip.ref,
      instanceId: minecraftInstance.instanceId,
    });
  }
}
