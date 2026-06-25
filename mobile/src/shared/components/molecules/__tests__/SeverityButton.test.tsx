import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { SeverityButton } from '../SeverityButton';
import { Typography } from '../../atoms/Typography';
import designTokens from '../../../theme/designTokens.json';

describe('<SeverityButton />', () => {
  it('renders level text correctly', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="Alto" selected={false} />
      );
    });

    // Act
    const typography = testRenderer!.root.findByType(Typography);

    // Assert
    expect(typography.props.children).toBe('Alto');
  });

  it('renders unselected styling when selected is false', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="Alto" selected={false} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.colors['text-secondary']);
  });

  it('renders high styling when selected is true and level is Alto', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="Alto" selected={true} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.components['button-red'].textColor);
  });

  it('renders medium styling when selected is true and level is Medio', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="Medio" selected={true} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.components['button-yellow'].textColor);
  });

  it('renders low styling when selected is true and level is Bajo', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="Bajo" selected={true} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.components['button-green'].textColor);
  });

  it('handles English severity inputs correctly', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="high" selected={true} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.components['button-red'].textColor);
  });

  it('handles casing and whitespace normalization correctly', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level="  medio  " selected={true} />
      );
    });

    // Act
    const color = typographyColor(testRenderer!);

    // Assert
    expect(color).toBe(designTokens.components['button-yellow'].textColor);
  });

  it('handles undefined or null level gracefully without crashing', async () => {
    // Arrange
    let testRenderer: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      testRenderer = renderer.create(
        <SeverityButton level={null as unknown as string} selected={true} />
      );
    });

    // Act
    const typography = testRenderer!.root.findByType(Typography);

    // Assert
    expect(typography).toBeTruthy();
  });
});

function typographyColor(testRenderer: renderer.ReactTestRenderer): string {
  const typography = testRenderer.root.findByType(Typography);
  return typography.props.color;
}
