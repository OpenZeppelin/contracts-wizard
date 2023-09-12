<script lang="ts">
  import axios from 'axios'
  import UserAvatar from './icons/UserAvatar.svelte';
  import WizAvatar from './icons/WizAvatar.svelte'
  import WizIcon from './icons/WizIcon.svelte'
  import XIcon from './icons/XIcon.svelte';

  export let functionCall: {
    name?: string,
    opts?: any
  }

  let showing: boolean = true
  let messages: { role: string, content: string }[] = [{
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

  const addMessage = (message: { role: string, content: string }) => {
    messages = [{
      role: message.role,
      content: message.content
    }, ...messages]
  }

  let input = ''
  let listener = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMessage({
        role: 'user',
        content: input
      })
      input = ''

      const chat = messages.slice(0, messages.length - 2).reverse()
      // console.log(chat)

      axios.post('/ai', {
        messages: chat
      }).then(result => {

        const choices = result.data?.choices
        if (choices) {
          const newMessage = choices[0]?.message
          if (newMessage) {

            if (newMessage.content) {
              // console.log('adding w content')
              addMessage(newMessage)
            }

            if (newMessage.function_call) {
              const name = newMessage.function_call.name as keyof typeof nameMap
              // console.log('adding w function')
              addMessage({
                role: 'assistant',
                content: 'Updated Wizard using ' + nameMap[name] + '.'
              })

              const opts = JSON.parse(newMessage.function_call.arguments)
              if (opts.access === 'false') { opts.access = false }
              if (opts.upgrade === 'false') { opts.upgrade = false }
              if (opts.timelock === 'false') { opts.timelock = false }

              functionCall = {
                name: name,
                opts: opts
              }
            }
          }
        }
      })
    }
  }

</script>

<div class="absolute bottom-8 right-8 h-[calc(100%-188px)]">
  <div class={`${showing ? '' : 'hidden'} absolute flex flex-col-reverse gap-3 overflow-y-auto right-0 bottom-[4.5rem] border-0 shadow-xl bg-gray-50 p-4 rounded-md w-80 animate-fade-up max-h-full`}>

    <div class="w-full flex items-center justify-between gap-2">
      <textarea bind:value={input} on:keypress={listener} placeholder="Ask me anything..." class="w-full text-sm shadow-lg h-32 p-4 rounded-md outline-none border-0 resize-none" />
    </div>

    {#each messages as message, index}
      <div class="flex gap-2">
        <div class="relative h-[36px] w-[36px] flex-none">
          <div class="absolute w-[36px] h-[36px] glimmery rounded-full animate-spin-slow"></div>
          {#if message.role === 'assistant'}
            <div class="absolute m-[2px] flex items-center justify-center w-[32px] h-[32px] bg-gray-900 text-gray-50 rounded-full">
              <WizAvatar />
            </div>
          {/if}
          {#if message.role === 'user'}
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
        {/if}
        {#if message.role === 'user'}
          <div class="text-sm bg-gray-100 rounded-md p-4">{message.content}</div>
        {/if}
      </div>
    {/each}

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