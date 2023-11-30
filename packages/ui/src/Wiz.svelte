<script lang="ts">
  import UserAvatar from './icons/UserAvatar.svelte';
  import WizAvatar from './icons/WizAvatar.svelte'
  import WizIcon from './icons/WizIcon.svelte'
  import XIcon from './icons/XIcon.svelte';
  import ExperimentalTooltip from './ExperimentalTooltip.svelte';
  import type { GenericOptions } from '@openzeppelin/wizard';
  import { nanoid } from 'nanoid';
  import MinimizeIcon from './icons/MinimizeIcon.svelte';
  import MaximizeIcon from './icons/MaximizeIcon.svelte';

  export let functionCall: {
    name?: string,
    opts?: any
  }
  export let currentOpts: Required<GenericOptions> | undefined

  interface Chat {
    role: 'user' | 'assistant' | 'system'
    content: string
  }

  const chatId = nanoid()
  let inProgress = false
  let currentMessage = ''
  let showing: boolean = true
  let expanded: boolean = false
  let messages: Chat[] = [{
    role: 'assistant',
    content: 'I can also edit Wizard settings directly, so from time to time I will update those based on your input.',
  }, {
    role: 'assistant',
    content: 'Wiz here 👋. Feel free to ask any questions you have about smart contract development.',
  }]

  const nameMap = {
    erc20: 'ERC20',
    erc721: 'ERC721',
    erc1155: 'ERC1155',
    governor: 'Governor',
    custom: 'Custom',
  }

  const sampleMessages = [
    'Make a token with supply of 10 million',
    'What does mintable do?',
    'Make a contract for a DAO',
  ]

  const addMessage = (message: Chat) => {
    messages = [{
      role: message.role,
      content: message.content
    }, ...messages]
  }

  const submitChat = (message: Chat) => {
    inProgress = true
    addMessage(message)
    input = ''

    const chat = messages.slice(0, messages.length - 2).reverse()

    fetch('/ai', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentOpts,
        chatId,
        messages: chat,
        stream: true,
      }),
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // Massage and parse the chunk of data
          const chunk = decoder.decode(value);
          result += chunk

          if (result.startsWith('{"function_call":')) {
            currentMessage = 'Executing function...'
          }
          else {
            currentMessage = result
          }
        }
      }

      currentMessage = ''
      if (result.startsWith('{"function_call":')) {
        try {
          const parsedResult = JSON.parse(result)
          const name = parsedResult.function_call.name as keyof typeof nameMap
          addMessage({
            role: 'assistant',
            content: 'Updated Wizard using ' + nameMap[name] + '.'
          })
          const opts = JSON.parse(parsedResult.function_call.arguments)
          if (opts.access === 'false') { opts.access = false }
          if (opts.upgradeable === 'false') { opts.upgradeable = false }
          if (opts.timelock === 'false') { opts.timelock = false }
          if (opts.proposalThreshold) { opts.proposalThreshold = opts.proposalThreshold.toString() }
          if (opts.quorumAbsolute) { opts.quorumAbsolute = opts.quorumAbsolute.toString() }
          if (opts.premint) { opts.premint = opts.premint.toString() }

          functionCall = {
            name: name,
            opts: opts
          }
        } catch (e) {
          addMessage({
            role: 'assistant',
            content: 'Error executing function. See console for details.'
          })
          console.log(e)
        }
      }
      else {
        addMessage({
          role: 'assistant',
          content: result
        })
      }
      inProgress = false
    })
  }

  let input = ''
  let listener = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inProgress || input.trim().length === 0) { return }

      submitChat({
        role: 'user',
        content: input.trim()
      })
    }
  }

</script>

<div class="absolute bottom-8 right-8 h-[calc(100%-188px)]">
  <div class={`${showing ? '' : 'hidden'} ${expanded ? 'w-[40rem]' : 'w-80'} max-w-[400px] min-h-[200px] absolute flex flex-col-reverse right-0 bottom-[4.5rem] border-0 shadow-xl bg-gray-50 rounded-md animate-fade-up max-h-full overflow-y-auto z-50`}>
    <div class={`flex flex-col-reverse gap-3 overflow-y-auto p-4 h-[calc(100%-800px)]`}>
      <div class="w-full flex items-center justify-between gap-2">
        <textarea bind:value={input} on:keypress={listener} placeholder="Ask me anything..." class="w-full text-sm shadow-lg h-32 p-4 rounded-md outline-none border-0 resize-none" />
        {#if input.length === 0 && messages.length < 3}
          <div class="absolute left-4 right-4 bottom-4 overflow-x-auto h-14 p-2 flex items-center gap-2">
            {#each sampleMessages as message}
              <button class="rounded-md border-0 p-2 h-full text-xs flex-none bg-gray-100 shadow-sm flex items-center cursor-pointer text-center hover:bg-gray-200" on:click={() => {
                submitChat({
                  role: 'user',
                  content: message
                })
              }}>
                {message}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      {#if currentMessage.length > 0}
        <div class="flex gap-2">
          <div class="relative h-[36px] w-[36px] flex-none">
            <div class="absolute w-[36px] h-[36px] glimmery rounded-full animate-spin-slow"></div>
            <div class="absolute m-[2px] flex items-center justify-center w-[32px] h-[32px] bg-gray-900 text-gray-50 rounded-full">
              <WizAvatar />
            </div>
          </div>
          <div class="text-sm bg-gray-200 rounded-md p-4">{currentMessage}</div>
        </div>
      {/if}

      {#each messages as message}
        <div class="flex gap-2">
          <div class="relative h-[36px] w-[36px] flex-none">
            <div class="absolute w-[36px] h-[36px] glimmery rounded-full animate-spin-slow"></div>
            {#if message.role === 'assistant'}
              <div class="absolute m-[2px] flex items-center justify-center w-[32px] h-[32px] bg-gray-900 text-gray-50 rounded-full">
                <WizAvatar />
              </div>
            {:else if message.role === 'user'}
              <div class="absolute m-[2px] flex items-center justify-center w-[32px] h-[32px] bg-gray-100 rounded-full">
                <UserAvatar />
              </div>
            {/if}
          </div>
          {#if message.role === 'assistant'}
            {#if message.content}
              <div class="text-sm bg-gray-200 rounded-md p-4">{message.content}</div>
            {:else}
              <div class="text-sm bg-gray-200 rounded-md font-bold p-4 text-gray-500">{'Called a function'}</div>
            {/if}
          {:else if message.role === 'user'}
            <div class="text-sm bg-gray-100 rounded-md p-4">{message.content}</div>
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex items-center justify-between border-0 border-b border-solid border-gray-200 p-4 font-bold text-gray-600">
      AI Assistant
      <div class="flex items-center gap-2">
        <div class="tooltip-container">
          <ExperimentalTooltip placement="bottom">
              The AI Assistant Wiz is powered by the <a target="_blank" rel="noopener noreferrer" href="https://openai.com/blog/openai-api">OpenAI API</a>, which utilizes AI/ML and therefore may produce inaccurate information.
              <br /><br />
              You should always review any information produced by Wiz to ensure that any results are accurate and suit your purposes.
          </ExperimentalTooltip>
        </div>
        <button class="shadow-xl rotate-45 border-none bg-gray-400 rounded-md h-6 w-6 text-white cursor-pointer" on:click={() => {
          expanded = !expanded
        }}>
          {#if expanded}
            <MinimizeIcon />
          {:else}
            <MaximizeIcon />
          {/if}
        </button>
      </div>
    </div>
  </div>
  <button class="absolute flex right-0 bottom-0 items-center justify-center border-0 shadow-xl bg-gray-50 h-16 w-16 p-4 rounded-full cursor-pointer hover:bg-white" on:click={() => {
    showing = !showing
  }}>
    {#if showing}
      <div class="animate-fade-in">
        <XIcon />
      </div>
    {:else}
      <div class="animate-fade-in">
        <WizIcon />
      </div>
    {/if}
  </button>
</div>