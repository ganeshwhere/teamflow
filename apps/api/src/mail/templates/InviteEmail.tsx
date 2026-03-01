import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text
} from "@react-email/components";

type InviteEmailProps = {
  inviterName: string;
  teamName: string;
  inviteUrl: string;
};

export function InviteEmail({ inviterName, teamName, inviteUrl }: InviteEmailProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>{`${inviterName} invited you to join ${teamName}`}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", marginBottom: "12px" }}>Join Team Flow</Heading>
          <Text style={{ color: "#111827", lineHeight: "22px" }}>
            {inviterName} invited you to join the <strong>{teamName}</strong> team.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            <Button
              href={inviteUrl}
              style={{
                backgroundColor: "#0f172a",
                borderRadius: "6px",
                color: "#ffffff",
                padding: "12px 18px",
                textDecoration: "none"
              }}
            >
              Join Team
            </Button>
          </Section>
          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            If you were not expecting this invitation, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
