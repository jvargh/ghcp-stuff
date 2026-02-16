#!/usr/bin/env node

/**
 * Simple MCP Client to get jokes from dailyjokemcp.azurewebsites.net
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log('MCP Joke Client');
  console.log('===============');
  console.log('');
  console.log('Usage: node mcp-joke-client.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --verbose, -v    Show detailed debug output');
  console.log('  --help, -h       Show this help message');
  console.log('');
  console.log('Default: Shows just the joke in a clean format');
  process.exit(0);
}

// Helper function for verbose logging
function log(...args) {
  if (verbose) {
    console.log(...args);
  }
}

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.messageId = 1;
    this.sessionId = null;
    this.cookies = [];
  }

  async connectAndGetJoke() {
    log('🎭 Connecting to Joke Server...');
    
    // Start directly with HTTP approach since MCP client isn't available
    await this.tryHttpApproach();
  }

  displayJoke(jokeText) {
    try {
      // Try to parse as JSON first
      const joke = JSON.parse(jokeText);
      if (joke.setup && joke.punchline) {
        console.log(`🎭 ${joke.setup}`);
        console.log(`🎆 ${joke.punchline}`);
        return;
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }
    
    // Fallback to plain text
    console.log(`🎭 ${jokeText}`);
  }

  async tryHttpApproach() {
    try {
      // First try proper MCP protocol over HTTP
      const mcpSuccess = await this.tryMCPProtocol();
      if (mcpSuccess) {
        return; // Exit early if MCP succeeded
      }
      
      // Then try different HTTP endpoints that might work
      const endpoints = [
        `${this.serverUrl}/joke`,
        `${this.serverUrl}/api/joke`,
        `${this.serverUrl}/tools/get-joke`,
        `${this.serverUrl}`
      ];

      const https = require('https');
      const http = require('http');
      
      for (const endpoint of endpoints) {
        log(`🌐 Trying HTTP GET: ${endpoint}`);
        
        const client = endpoint.startsWith('https') ? https : http;
        
        try {
          const response = await new Promise((resolve, reject) => {
            const req = client.get(endpoint, {
              headers: {
                'User-Agent': 'MCP-Joke-Client/1.0',
                'Accept': 'text/event-stream, application/json, text/plain, */*',
                'Cache-Control': 'no-cache'
              }
            }, (res) => {
              let data = '';
              
              // Handle Server-Sent Events
              if (res.headers['content-type'] && res.headers['content-type'].includes('text/event-stream')) {
                console.log('📡 Handling Server-Sent Events...');
                
                res.on('data', (chunk) => {
                  const lines = chunk.toString().split('\n');
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      try {
                        const jsonData = JSON.parse(line.substring(6));
                        console.log('📨 SSE Message:', JSON.stringify(jsonData, null, 2));
                        
                        // Try to extract joke from MCP response
                        if (jsonData.result && jsonData.result.content) {
                          const joke = jsonData.result.content.find(c => c.type === 'text');
                          if (joke) {
                            console.log('✅ Got joke via SSE:');
                            console.log('🎭 ' + joke.text);
                            return;
                          }
                        }
                      } catch (e) {
                        console.log('📡 SSE data:', line.substring(6));
                      }
                    }
                  }
                });
                
                res.on('end', () => {
                  resolve({ statusCode: res.statusCode, data: 'SSE stream ended' });
                });
              } else {
                // Handle regular HTTP responses
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, data }));
              }
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
              req.destroy();
              reject(new Error('Request timeout'));
            });
          });

          if (response.statusCode === 200) {
            log('✅ Success! Response:');
            const joke = this.extractJoke(response.data);
            this.displayJoke(joke);
            return;
          } else {
            log(`❌ HTTP ${response.statusCode}: ${response.data.substring(0, 200)}`);
          }
        } catch (error) {
          log(`❌ Failed: ${error.message}`);
        }
      }
      
      // If MCP didn't work, show fallback joke
      if (!verbose) {
        console.log('🤡 No joke available from server. Here\'s one for you:');
        console.log('🎭 Why don\'t scientists trust atoms?');
        console.log('🎆 Because they make up everything!');
      } else {
        console.log('🤡 Could not get a joke from the server. Here\'s one for you: Why don\'t scientists trust atoms? Because they make up everything!');
      }
      
    } catch (error) {
      log('❌ HTTP approach failed:', error.message);
    }
  }

  async tryMCPProtocol() {
    const https = require('https');
    
    log('🔌 Trying MCP protocol over HTTP...');
    
    return new Promise((resolve) => {
      // First initialize
      const initData = JSON.stringify({
        jsonrpc: '2.0',
        id: this.messageId++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'simple-joke-client',
            version: '1.0.0'
          }
        }
      });
      
      const options = {
        hostname: 'dailyjokemcp.azurewebsites.net',
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Content-Length': Buffer.byteLength(initData),
          'User-Agent': 'MCP-Joke-Client/1.0'
        }
      };
      
      const req = https.request(options, (res) => {
        log(`📡 MCP Response Status: ${res.statusCode}`);
        log('🔍 Response Headers:', JSON.stringify(res.headers, null, 2));
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            // Handle Server-Sent Events format
            if (data.includes('event: message') && data.includes('data: {')) {
              log('📡 Parsing SSE response...');
              const lines = data.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const jsonData = JSON.parse(line.substring(6));
                  log('📨 MCP Initialize Response:', JSON.stringify(jsonData, null, 2));
                  
                  if (jsonData.result) {
                    log('✅ MCP Initialized, capturing session info...');
                    
                    // Capture session information
                    if (res.headers['set-cookie']) {
                      this.cookies = res.headers['set-cookie'];
                      log('🍪 Captured cookies:', this.cookies);
                    }
                    
                    // Look for session ID in various places
                    if (res.headers['mcp-session-id']) {
                      this.sessionId = res.headers['mcp-session-id'];
                    } else if (jsonData.result.sessionId) {
                      this.sessionId = jsonData.result.sessionId;
                    } else if (res.headers['x-session-id']) {
                      this.sessionId = res.headers['x-session-id'];
                    } else {
                      // Generate a session ID based on the request
                      this.sessionId = `client-session-${Date.now()}`;
                    }
                    
                    log('🔑 Session ID:', this.sessionId);
                    
                    // First list available tools, then make joke request
                    setTimeout(() => {
                      this.listTools().then(() => {
                        setTimeout(() => {
                          this.makeJokeRequest().then(() => resolve());
                        }, 500);
                      });
                    }, 500);
                    return;
                  }
                }
              }
            }
            
            // Try regular JSON parse
            const response = JSON.parse(data);
            console.log('📨 MCP Initialize Response:', JSON.stringify(response, null, 2));
            
            if (response.result) {
              console.log('✅ MCP Initialized, now requesting joke...');
              
              // Make a separate request for the joke
              setTimeout(() => {
                this.makeJokeRequest().then(() => resolve());
              }, 500);
            }
          } catch (e) {
            log('📨 Raw Response:', data);
            resolve();
          }
        });
      });
      
      req.on('error', (error) => {
        log(`❌ MCP request failed: ${error.message}`);
        resolve();
      });
      
      req.write(initData);
      req.end();
    });
  }

  async listTools() {
    const https = require('https');
    
    log('🛠️ Listing available MCP tools...');
    
    return new Promise((resolve) => {
      const toolsData = JSON.stringify({
        jsonrpc: '2.0',
        id: this.messageId++,
        method: 'tools/list',
        params: {}
      });
      
      const options = {
        hostname: 'dailyjokemcp.azurewebsites.net',
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Content-Length': Buffer.byteLength(toolsData),
          'User-Agent': 'MCP-Joke-Client/1.0'
        }
      };
      
      // Add session information
      if (this.sessionId) {
        options.headers['mcp-session-id'] = this.sessionId;
        options.headers['X-Session-ID'] = this.sessionId;
        options.headers['Authorization'] = `Bearer ${this.sessionId}`;
      }
      
      if (this.cookies && this.cookies.length > 0) {
        options.headers['Cookie'] = this.cookies.join('; ');
      }
      
      const req = https.request(options, (res) => {
        log(`📡 Tools List Response Status: ${res.statusCode}`);
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            // Handle Server-Sent Events format
            if (data.includes('event: message') && data.includes('data: {')) {
              log('📡 Parsing SSE tools response...');
              const lines = data.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const response = JSON.parse(line.substring(6));
                  log('📨 Available Tools:', JSON.stringify(response, null, 2));
                  
                  if (response.result && response.result.tools) {
                    const tools = response.result.tools;
                    log('🛠️ Found tools:', tools.map(t => t.name).join(', '));
                    
                    // Store the first tool name for the joke request
                    if (tools.length > 0) {
                      this.availableToolName = tools[0].name;
                      log('🎯 Will use tool:', this.availableToolName);
                    }
                  }
                }
              }
              resolve();
              return;
            }
            
            // Try regular JSON parse
            const response = JSON.parse(data);
            log('📨 Available Tools:', JSON.stringify(response, null, 2));
            
            if (response.result && response.result.tools) {
              const tools = response.result.tools;
              log('🛠️ Found tools:', tools.map(t => t.name).join(', '));
              
              // Store the first tool name for the joke request
              if (tools.length > 0) {
                this.availableToolName = tools[0].name;
                log('🎯 Will use tool:', this.availableToolName);
              }
            }
            
            resolve();
          } catch (e) {
            log('📨 Raw Tools Response:', data);
            resolve();
          }
        });
      });
      
      req.on('error', (error) => {
        log(`❌ Tools request failed: ${error.message}`);
        resolve();
      });
      
      req.write(toolsData);
      req.end();
    });
  }

  async makeJokeRequest() {
    const https = require('https');
    
    log('🎪 Requesting joke from MCP server...');
    
    return new Promise((resolve) => {
      const jokeData = JSON.stringify({
        jsonrpc: '2.0',
        id: this.messageId++,
        method: 'tools/call',
        params: {
          name: this.availableToolName || 'get-joke',
          arguments: {}
        }
      });
      
      const options = {
        hostname: 'dailyjokemcp.azurewebsites.net',
        path: '/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Content-Length': Buffer.byteLength(jokeData),
          'User-Agent': 'MCP-Joke-Client/1.0'
        }
      };
      
      // Add session information
      if (this.sessionId) {
        options.headers['mcp-session-id'] = this.sessionId;
        options.headers['X-Session-ID'] = this.sessionId;
        options.headers['Authorization'] = `Bearer ${this.sessionId}`;
      }
      
      if (this.cookies && this.cookies.length > 0) {
        options.headers['Cookie'] = this.cookies.join('; ');
      }
      
      const req = https.request(options, (res) => {
        log(`📡 Joke Response Status: ${res.statusCode}`);
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            // Handle Server-Sent Events format
            if (data.includes('event: message') && data.includes('data: {')) {
              log('📡 Parsing SSE joke response...');
              const lines = data.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const response = JSON.parse(line.substring(6));
                  log('📨 Joke Response:', JSON.stringify(response, null, 2));
                  
                  if (response.result && response.result.content && !response.result.isError) {
                    const textContent = response.result.content.find(c => c.type === 'text');
                    if (textContent) {
                      this.displayJoke(textContent.text);
                      resolve(true);
                      return;
                    }
                  }
                  
                  if (response.error) {
                    log('❌ MCP Error:', response.error.message);
                  }
                }
              }
              resolve();
              return;
            }
            
            // Try regular JSON parse
            const response = JSON.parse(data);
            log('📨 Joke Response:', JSON.stringify(response, null, 2));
            
            if (response.result && response.result.content && !response.result.isError) {
              const textContent = response.result.content.find(c => c.type === 'text');
              if (textContent) {
                this.displayJoke(textContent.text);
                resolve(true);
                return;
              }
            }
            
            if (response.error) {
              log('❌ MCP Error:', response.error.message);
            }
            
            resolve();
          } catch (e) {
            log('📨 Raw Joke Response:', data);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        log(`❌ Joke request failed: ${error.message}`);
        resolve(false);
      });
      
      req.write(jokeData);
      req.end();
    });
  }

  extractJoke(data) {
    try {
      const parsed = JSON.parse(data);
      
      // Try different possible joke fields
      const jokeFields = ['joke', 'content', 'text', 'body', 'setup', 'punchline'];
      
      for (const field of jokeFields) {
        if (parsed[field]) {
          return parsed[field];
        }
      }
      
      // If it's an array, get first item
      if (Array.isArray(parsed) && parsed.length > 0) {
        return this.extractJoke(JSON.stringify(parsed[0]));
      }
      
      // Return the whole response if it looks like a joke
      if (typeof parsed === 'string' && parsed.length < 500) {
        return parsed;
      }
      
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return as is if it looks like text
      if (typeof data === 'string' && data.length < 500) {
        return data;
      }
      return data.substring(0, 200) + '...';
    }
  }
}

// Run the client
if (verbose) {
  console.log('🎭 MCP Joke Client - Verbose Mode');
  console.log('================================');
}

const client = new MCPClient('https://dailyjokemcp.azurewebsites.net/mcp');
client.connectAndGetJoke().catch((error) => {
  if (verbose) {
    console.error('Error:', error);
  }
});