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

type TaskAssignedEmailProps = {
  assigneeName: string;
  taskTitle: string;
  projectName: string;
  teamName: string;
  taskUrl: string;
  priority?: string;
};

export function TaskAssignedEmail({
  assigneeName,
  taskTitle,
  projectName,
  teamName,
  taskUrl,
  priority
}: TaskAssignedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`You have been assigned: ${taskTitle}`}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px" }}>
          <Heading style={{ fontSize: "24px", marginBottom: "12px" }}>Task Assigned</Heading>
          <Text style={{ color: "#111827", lineHeight: "22px" }}>Hi {assigneeName},</Text>
          <Text style={{ color: "#111827", lineHeight: "22px" }}>
            You were assigned a new task in <strong>{teamName}</strong>.
          </Text>
          <Text style={{ color: "#0f172a", fontWeight: 700 }}>{taskTitle}</Text>
          <Text style={{ color: "#334155" }}>Project: {projectName}</Text>
          <Section style={{ margin: "12px 0" }}>
            <Text style={{ backgroundColor: "#e2e8f0", borderRadius: "999px", color: "#1e293b", display: "inline-block", margin: 0, padding: "4px 10px" }}>
              Priority: {priority ?? "MEDIUM"}
            </Text>
          </Section>
          <Section style={{ margin: "24px 0" }}>
            <Button
              href={taskUrl}
              style={{
                backgroundColor: "#2563eb",
                borderRadius: "6px",
                color: "#ffffff",
                padding: "12px 18px",
                textDecoration: "none"
              }}
            >
              View Task
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
