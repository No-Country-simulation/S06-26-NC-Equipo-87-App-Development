import React, { act } from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';
import App from './App';

describe('<App />', () => {
  it('renders correctly', async () => {
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<App />);
    });
    expect(renderResult).toBeTruthy();
    const tree = renderResult!.toJSON();
    expect(tree).toBeTruthy();
  });

  it('contains the default welcome message text', async () => {
    let renderResult: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      renderResult = renderer.create(<App />);
    });
    expect(renderResult).toBeTruthy();
    const textComponent = renderResult!.root.findByType(Text);
    expect(textComponent.props.children).toBe('Open up App.tsx to start working on your app!');
  });
});
